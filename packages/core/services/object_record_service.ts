import type {
  ConnectionSafeAny,
  CreatedObjectRecord,
  FullObjectRecord,
  ObjectRecord,
  ObjectRecordData,
  ObjectRecordUpsertData,
} from '@supaglue/types';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { StandardOrCustomObject } from '@supaglue/types/standard_or_custom_object';
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
  ): Promise<CreatedObjectRecord> {
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
      objectName,
    };
  }

  public async createCustomObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    data: ObjectRecordUpsertData
  ): Promise<string> {
    if (!['salesforce', 'hubspot'].includes(connection.providerName)) {
      throw new BadRequestError(`Provider ${connection.providerName} does not support custom object writes`);
    }
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    const id = await remoteClient.createObjectRecord(
      {
        type: 'custom',
        name: objectName,
      },
      data
    );

    // TODO: Implement cache invalidation once custom object syncs are supported again

    return id;
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
  ): Promise<FullObjectRecord> {
    return await this.#getFullObjectRecord(connection, { type: 'standard', name: objectName }, recordId);
  }

  async #getCustomFullObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    recordId: string
  ): Promise<FullObjectRecord> {
    return await this.#getFullObjectRecord(connection, { type: 'custom', name: objectName }, recordId);
  }

  async #getFullObjectRecord(
    connection: ConnectionSafeAny,
    standardOrCustomObject: StandardOrCustomObject,
    recordId: string
  ): Promise<FullObjectRecord> {
    let fieldMappingConfig = null;
    if (standardOrCustomObject.type === 'standard') {
      fieldMappingConfig = await this.#connectionService.getFieldMappingConfig(
        connection.id,
        'standard',
        standardOrCustomObject.name
      );
    }
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    const fields =
      !fieldMappingConfig || fieldMappingConfig?.type === 'inherit_all_fields'
        ? (await remoteClient.listProperties(standardOrCustomObject)).map((p) => p.id)
        : [
            ...new Set([
              ...fieldMappingConfig.coreFieldMappings.map((m) => m.mappedField),
              ...fieldMappingConfig.additionalFieldMappings.map((m) => m.mappedField),
            ]),
          ];
    const record = await remoteClient.getObjectRecord(standardOrCustomObject, recordId, fields);
    return {
      id: recordId,
      objectName: standardOrCustomObject.name,
      mappedProperties: fieldMappingConfig ? mapObjectToSchema(record.data, fieldMappingConfig) : record.data,
      rawData: record.data,
      metadata: record.metadata,
    };
  }

  public async getStandardObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    recordId: string
  ): Promise<ObjectRecord> {
    const { id, rawData } = await this.#getStandardFullObjectRecord(connection, objectName, recordId);
    return {
      id,
      objectName,
      data: rawData,
    };
  }

  public async getCustomObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    recordId: string
  ): Promise<ObjectRecord> {
    const { id, rawData } = await this.#getCustomFullObjectRecord(connection, objectName, recordId);
    return {
      id,
      objectName,
      data: rawData,
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

  public async updateCustomObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    recordId: string,
    data: ObjectRecordUpsertData
  ): Promise<void> {
    const remoteClient = await this.#remoteService.getRemoteClient(connection.id);
    await remoteClient.updateObjectRecord(
      {
        type: 'custom',
        name: objectName,
      },
      recordId,
      data
    );
    // TODO: Implement cache invalidation for custom objects
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
