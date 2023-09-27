import type {
  ConnectionSafeAny,
  CreatedStandardObjectRecord,
  ObjectRecordData,
  ObjectRecordUpsertData,
  StandardFullObjectRecord,
  StandardObjectRecord,
} from '@supaglue/types';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { ConnectionService, RemoteService } from '.';
import { BadRequestError, CacheInvalidationError } from '../errors';
import type { DestinationService } from './destination_service';
import type { SyncService } from './sync_service';

export class ObjectRecordService {
  readonly #connectionService: ConnectionService;
  readonly #remoteService: RemoteService;
  readonly #destinationService: DestinationService;
  readonly #syncService: SyncService;

  public constructor(
    connectionService: ConnectionService,
    remoteService: RemoteService,
    destinationService: DestinationService,
    syncService: SyncService
  ) {
    this.#connectionService = connectionService;
    this.#remoteService = remoteService;
    this.#destinationService = destinationService;
    this.#syncService = syncService;
  }

  public async createStandardObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    data: ObjectRecordUpsertData
  ): Promise<CreatedStandardObjectRecord> {
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(
      connection.id,
      'standard',
      objectName
    );
    const unmappedData = mapSchemaToObject(data, fieldMappingConfig);
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    const id = await remoteClient.createObjectRecord(
      {
        type: 'standard',
        name: objectName,
      },
      unmappedData
    );

    await this.#cacheInvalidateStandardObjectRecord(connection, objectName, id);

    return {
      id,
      standardObjectName: objectName,
    };
  }

  async #cacheInvalidateStandardObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    id: string
  ): Promise<void> {
    const sync = await this.#syncService.findByConnectionIdAndObjectTypeAndObject(
      connection.id,
      'standard',
      objectName
    );
    if (!sync || sync.paused) {
      return;
    }
    const [writer] = await this.#destinationService.getWriterByProviderId(connection.providerId);
    if (writer) {
      try {
        const record = await this.#getStandardFullObjectRecord(connection, objectName, id);
        await writer.upsertStandardObjectRecord(connection, objectName, record);
      } catch (err: any) {
        throw new CacheInvalidationError(err.message, err);
      }
    }
  }

  async #getStandardFullObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    recordId: string
  ): Promise<StandardFullObjectRecord> {
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(
      connection.id,
      'standard',
      objectName
    );
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    const fields =
      fieldMappingConfig.type === 'inherit_all_fields'
        ? (await remoteClient.listProperties({ type: 'standard', name: objectName })).map((p) => p.id)
        : [
            ...new Set([
              ...fieldMappingConfig.coreFieldMappings.map((m) => m.mappedField),
              ...fieldMappingConfig.additionalFieldMappings.map((m) => m.mappedField),
            ]),
          ];
    const record = await remoteClient.getObjectRecord(
      {
        type: 'standard',
        name: objectName,
      },
      recordId,
      fields
    );
    return {
      id: recordId,
      standardObjectName: objectName,
      mappedProperties: mapObjectToSchema(record.data, fieldMappingConfig),
      rawData: record.data,
      metadata: record.metadata,
    };
  }

  public async getStandardObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    recordId: string
  ): Promise<StandardObjectRecord> {
    const {
      id,
      standardObjectName,
      mappedProperties: mappedData,
    } = await this.#getStandardFullObjectRecord(connection, objectName, recordId);
    return {
      id,
      standardObjectName,
      data: mappedData,
    };
  }

  public async updateStandardObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    recordId: string,
    data: ObjectRecordUpsertData
  ): Promise<void> {
    const fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(
      connection.id,
      'standard',
      objectName
    );
    const unmappedData = mapSchemaToObject(data, fieldMappingConfig);
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    await remoteClient.updateObjectRecord(
      {
        type: 'standard',
        name: objectName,
      },
      recordId,
      unmappedData
    );
    await this.#cacheInvalidateStandardObjectRecord(connection, objectName, recordId);
  }
}

function mapSchemaToObject(
  data: ObjectRecordUpsertData,
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

        throw new BadRequestError(`Field ${key} does not exist in schema or is not mapped`);
      }, {});
    }
  }
}

function mapObjectToSchema(data: ObjectRecordData, fieldMappingConfig: FieldMappingConfig): ObjectRecordData {
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
        additionalFields: additionalFields,
      };
    }
  }
}
