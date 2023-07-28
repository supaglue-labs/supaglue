import type { PrismaClient } from '@supaglue/db';
import type { ConnectionSafeAny, ObjectRecordUpsertData } from '@supaglue/types';
import type {
  CreatedEntityRecord,
  EntityRecord,
  EntityRecordData,
  EntityRecordUpsertData,
} from '@supaglue/types/entity_record';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { ConnectionService, RemoteService } from '.';
import { BadRequestError } from '../errors';
import type { DestinationService } from './destination_service';
import type { EntityService } from './entity_service';

export class EntityRecordService {
  readonly #prisma: PrismaClient;
  readonly #entityService: EntityService;
  readonly #connectionService: ConnectionService;
  readonly #remoteService: RemoteService;
  readonly #destinationService: DestinationService;

  public constructor(
    prisma: PrismaClient,
    entityService: EntityService,
    connectionService: ConnectionService,
    remoteService: RemoteService,
    destinationService: DestinationService
  ) {
    this.#prisma = prisma;
    this.#entityService = entityService;
    this.#connectionService = connectionService;
    this.#remoteService = remoteService;
    this.#destinationService = destinationService;
  }

  public async createEntityRecord(
    connection: ConnectionSafeAny,
    entityName: string,
    data: EntityRecordUpsertData
  ): Promise<CreatedEntityRecord> {
    const entity = await this.#entityService.getByNameAndApplicationId(entityName, connection.applicationId);
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    const { object, fieldMappingConfig } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connection.id,
      entity.id
    );
    const mappedData = mapEntityToObjectFields(data, fieldMappingConfig);
    const id = await remoteClient.createObjectRecord(object, mappedData);
    return {
      id,
      entity: {
        id: entity.id,
        name: entity.name,
      },
    };
  }

  public async getEntityRecord(
    connection: ConnectionSafeAny,
    entityName: string,
    recordId: string
  ): Promise<EntityRecord> {
    const entity = await this.#entityService.getByNameAndApplicationId(entityName, connection.applicationId);
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    const { object, fieldMappingConfig } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connection.id,
      entity.id
    );
    // TODO: this should be impossible; we are handling this case because we are mixing up
    // entities with schemas, and using them interchangeably.
    // We should separate these concepts later.
    if (fieldMappingConfig.type === 'inherit_all_fields') {
      throw new BadRequestError('Unexpectedly got inherit_all_fields field mapping config');
    }
    const fields = [
      ...new Set([
        ...fieldMappingConfig.coreFieldMappings.map((m) => m.mappedField),
        ...fieldMappingConfig.additionalFieldMappings.map((m) => m.mappedField),
      ]),
    ];
    const record = await remoteClient.getObjectRecord(object, recordId, fields);
    return {
      id: recordId,
      entity: {
        id: entity.id,
        name: entity.name,
      },
      data: mapObjectToEntityFields(record.data, fieldMappingConfig),
    };
  }

  public async updateEntityRecord(
    connection: ConnectionSafeAny,
    entityName: string,
    recordId: string,
    data: EntityRecordUpsertData
  ): Promise<void> {
    const entity = await this.#entityService.getByNameAndApplicationId(entityName, connection.applicationId);
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    const { object, fieldMappingConfig } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connection.id,
      entity.id
    );
    const mappedData = mapEntityToObjectFields(data, fieldMappingConfig);
    await remoteClient.updateObjectRecord(object, recordId, mappedData);
  }
}

function mapEntityToObjectFields(
  data: EntityRecordUpsertData,
  fieldMappingConfig: FieldMappingConfig
): ObjectRecordUpsertData {
  switch (fieldMappingConfig.type) {
    case 'inherit_all_fields':
      return data;
    case 'defined': {
      return Object.entries(data).reduce((acc, [key, value]) => {
        const coreFieldMapping = fieldMappingConfig.coreFieldMappings.find((m) => m.schemaField === key);
        const additionalFieldMapping = fieldMappingConfig.additionalFieldMappings.find((m) => m.schemaField === key);

        if (coreFieldMapping) {
          return { ...acc, [coreFieldMapping.mappedField]: value };
        } else if (additionalFieldMapping) {
          return { ...acc, [additionalFieldMapping.mappedField]: value };
        }

        throw new BadRequestError(`Field ${key} does not exist in entity or is not mapped`);
      }, {});
    }
  }
}

function mapObjectToEntityFields(
  data: Record<string, unknown>,
  fieldMappingConfig: FieldMappingConfig
): EntityRecordData {
  switch (fieldMappingConfig.type) {
    case 'inherit_all_fields':
      return data;
    case 'defined': {
      const coreFields = fieldMappingConfig.coreFieldMappings.reduce((acc, { schemaField, mappedField }) => {
        const value = data[mappedField];
        if (value) {
          return { ...acc, [schemaField]: value };
        }
        return acc;
      }, {} as Record<string, unknown>);

      const additionalFields = fieldMappingConfig.additionalFieldMappings.reduce(
        (acc, { schemaField, mappedField }) => {
          const value = data[mappedField];
          if (value) {
            return { ...acc, [schemaField]: value };
          }
          return acc;
        },
        {} as Record<string, unknown>
      );

      return {
        ...coreFields,
        additionalFields,
      };
    }
  }
}
