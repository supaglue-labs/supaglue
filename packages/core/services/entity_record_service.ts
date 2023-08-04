import type { ConnectionSafeAny, ObjectRecordUpsertData } from '@supaglue/types';
import type { Association, AssociationCreateParams, ListAssociationsParams } from '@supaglue/types/association';
import type {
  CreatedEntityRecord,
  EntityRecord,
  EntityRecordData,
  EntityRecordUpsertData,
  FullEntityRecord,
} from '@supaglue/types/entity_record';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { ConnectionService, RemoteService } from '.';
import { BadRequestError } from '../errors';
import type { DestinationService } from './destination_service';
import type { EntityService } from './entity_service';
import type { SyncService } from './sync_service';

export class EntityRecordService {
  readonly #entityService: EntityService;
  readonly #connectionService: ConnectionService;
  readonly #remoteService: RemoteService;
  readonly #destinationService: DestinationService;
  readonly #syncService: SyncService;

  public constructor(
    entityService: EntityService,
    connectionService: ConnectionService,
    remoteService: RemoteService,
    destinationService: DestinationService,
    syncService: SyncService
  ) {
    this.#entityService = entityService;
    this.#connectionService = connectionService;
    this.#remoteService = remoteService;
    this.#destinationService = destinationService;
    this.#syncService = syncService;
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
    await this.#cacheInvalidateEntityRecord(connection, entityName, id);
    return {
      id,
      entity: {
        id: entity.id,
        name: entity.name,
      },
    };
  }

  async #cacheInvalidateEntityRecord(connection: ConnectionSafeAny, entityName: string, id: string): Promise<void> {
    const sync = await this.#syncService.findByConnectionIdAndEntity(connection.id, entityName);
    if (!sync || sync.paused) {
      return;
    }
    const [writer] = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      const entity = await this.#getFullEntityRecord(connection, entityName, id);
      await writer.upsertEntityRecord(connection, entityName, entity);
    }
  }

  async #getFullEntityRecord(
    connection: ConnectionSafeAny,
    entityName: string,
    recordId: string
  ): Promise<FullEntityRecord> {
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
      mappedData: mapObjectToEntityFields(record.data, fieldMappingConfig),
      rawData: record.data,
      metadata: record.metadata,
    };
  }

  public async getEntityRecord(
    connection: ConnectionSafeAny,
    entityName: string,
    recordId: string
  ): Promise<EntityRecord> {
    const { id, entity, mappedData } = await this.#getFullEntityRecord(connection, entityName, recordId);
    return {
      id,
      entity,
      data: mappedData,
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

    await this.#cacheInvalidateEntityRecord(connection, entityName, recordId);
  }

  public async listAssociations(connectionId: string, params: ListAssociationsParams): Promise<Association[]> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);
    // map entity to object
    const { object: sourceObject } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connectionId,
      params.sourceRecord.entityId
    );
    const { object: targetObject } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connectionId,
      params.targetEntityId
    );
    const ret = await remoteClient.listAssociations({
      sourceRecord: {
        id: params.sourceRecord.id,
        object:
          sourceObject.type === 'standard'
            ? { type: 'standard', name: sourceObject.name }
            : { type: 'custom', id: sourceObject.name },
      },
      targetObject:
        targetObject.type === 'standard'
          ? { type: 'standard', name: targetObject.name }
          : { type: 'custom', id: targetObject.name },
    });
    return ret.map((r) => ({
      sourceRecord: params.sourceRecord,
      targetRecord: {
        id: r.targetRecord.id,
        entityId: params.targetEntityId,
      },
      associationTypeId: r.associationTypeId,
    }));
  }

  public async createAssociation(connectionId: string, params: AssociationCreateParams): Promise<Association> {
    const remoteClient = await this.#remoteService.getRemoteClient(connectionId);
    // map entity to object
    const { object: sourceObject } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connectionId,
      params.sourceRecord.entityId
    );
    const { object: targetObject } = await this.#connectionService.getObjectAndFieldMappingConfigForEntity(
      connectionId,
      params.targetRecord.entityId
    );
    const ret = await remoteClient.createAssociation({
      sourceRecord: {
        id: params.sourceRecord.id,
        object:
          sourceObject.type === 'standard'
            ? { type: 'standard', name: sourceObject.name }
            : { type: 'custom', id: sourceObject.name },
      },
      targetRecord: {
        id: params.targetRecord.id,
        object:
          targetObject.type === 'standard'
            ? { type: 'standard', name: targetObject.name }
            : { type: 'custom', id: targetObject.name },
      },
      associationTypeId: params.associationTypeId,
    });
    return {
      sourceRecord: params.sourceRecord,
      targetRecord: params.targetRecord,
      associationTypeId: ret.associationTypeId,
    };
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

function mapObjectToEntityFields(data: EntityRecordData, fieldMappingConfig: FieldMappingConfig): EntityRecordData {
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
