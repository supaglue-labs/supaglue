import type { DestinationWriter } from '@supaglue/core/destination_writers/base';
import { shouldDeleteRecords } from '@supaglue/core/destination_writers/util';
import type { ConnectionService, RemoteService, SyncConfigService } from '@supaglue/core/services';
import type { DestinationService } from '@supaglue/core/services/destination_service';
import type { EntityService } from '@supaglue/core/services/entity_service';
import type { ListedObjectRecord, MappedListedObjectRecord, PropertiesWithAdditionalFields } from '@supaglue/types';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { ApplicationFailure, Context } from '@temporalio/activity';
import type { Readable } from 'stream';
import { pipeline, Transform } from 'stream';
import type { ApplicationService, SyncService } from '../services';

/**
 * @deprecated
 */
export type SyncEntityRecordsArgs = {
  syncId: string;
  connectionId: string;
  entityId: string;
  updatedAfterMs?: number;
};

/**
 * @deprecated
 */
export type SyncEntityRecordsResult = {
  syncId: string;
  connectionId: string;
  entityId: string;
  maxLastModifiedAtMs: number | null;
  numRecordsSynced: number;
};

/**
 * @deprecated
 */
export function createSyncEntityRecords(
  connectionService: ConnectionService,
  remoteService: RemoteService,
  destinationService: DestinationService,
  syncService: SyncService,
  syncConfigService: SyncConfigService,
  applicationService: ApplicationService,
  entityService: EntityService
) {
  /**
   * @deprecated
   */
  return async function syncEntityRecords({
    syncId,
    connectionId,
    entityId,
    updatedAfterMs,
  }: SyncEntityRecordsArgs): Promise<SyncEntityRecordsResult> {
    const sync = await syncService.getSyncById(syncId);
    const syncConfig = await syncConfigService.getById(sync.syncConfigId);
    const connection = await connectionService.getSafeById(connectionId);
    const entity = await entityService.getById(entityId);

    async function writeObjects(writer: DestinationWriter) {
      const client = await remoteService.getRemoteClient(connectionId);
      const { object, fieldMappingConfig } = await connectionService.getObjectAndFieldMappingConfigForEntity(
        connectionId,
        entityId
      );
      const fieldsToFetch = getFieldsToFetch(fieldMappingConfig);
      switch (object.type) {
        case 'standard': {
          const stream = await client.streamStandardObjectRecords(object.name, fieldsToFetch, updatedAfter, heartbeat);
          return await writer.writeEntityRecords(
            connection,
            entity.name,
            toMappedPropertiesReadable(stream, fieldMappingConfig),
            heartbeat,
            /* diffAndDeleteRecords */ shouldDeleteRecords(!updatedAfterMs, connection.providerName)
          );
        }
        case 'custom': {
          const stream = await client.streamCustomObjectRecords(object.name, fieldsToFetch, updatedAfter, heartbeat);
          return await writer.writeEntityRecords(
            connection,
            entity.name,
            toMappedPropertiesReadable(stream, fieldMappingConfig),
            heartbeat,
            /* diffAndDeleteRecords */ shouldDeleteRecords(!updatedAfterMs, connection.providerName)
          );
        }
      }
    }

    const application = await applicationService.getById(connection.applicationId);

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    const writer = await destinationService.getWriterByDestinationId(syncConfig.destinationId);
    if (!writer) {
      throw ApplicationFailure.nonRetryable(`No destination found for id ${syncConfig.destinationId}`);
    }

    const heartbeating = setInterval(heartbeat, 10_000);

    try {
      const result = await writeObjects(writer);

      return {
        syncId: syncId,
        connectionId,
        entityId,
        maxLastModifiedAtMs: result.maxLastModifiedAt ? result.maxLastModifiedAt.getTime() : null,
        numRecordsSynced: result.numRecords,
      };
    } finally {
      clearInterval(heartbeating);
    }
  };
}

function toMappedPropertiesReadable(readable: Readable, fieldMappingConfig: FieldMappingConfig): Readable {
  return pipeline(
    readable,
    new Transform({
      objectMode: true,
      transform: (chunk: ListedObjectRecord, encoding, callback) => {
        try {
          const mappedListedObjectRecord: MappedListedObjectRecord = {
            ...chunk,
            mappedProperties: toMappedProperties(chunk.rawProperties, fieldMappingConfig),
          };
          callback(null, mappedListedObjectRecord);
        } catch (e: any) {
          return callback(e);
        }
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {}
  );
}

function heartbeat() {
  Context.current().heartbeat();
}

function getFieldsToFetch(fieldMappingConfig: FieldMappingConfig): FieldsToFetch {
  if (fieldMappingConfig.type === 'inherit_all_fields') {
    return {
      type: 'inherit_all_fields',
    };
  }

  return {
    type: 'defined',
    fields: [
      ...new Set([
        ...fieldMappingConfig.coreFieldMappings.map(({ mappedField }) => mappedField),
        ...fieldMappingConfig.additionalFieldMappings.map(({ mappedField }) => mappedField),
      ]),
    ],
  };
}

function toMappedProperties(
  properties: Record<string, any>,
  fieldMappingConfig: FieldMappingConfig
): PropertiesWithAdditionalFields {
  if (fieldMappingConfig.type === 'inherit_all_fields') {
    return properties;
  }

  return {
    ...Object.fromEntries(
      fieldMappingConfig.coreFieldMappings.map(({ schemaField, mappedField }) => [schemaField, properties[mappedField]])
    ),
    additionalFields: Object.fromEntries(
      fieldMappingConfig.additionalFieldMappings.map(({ schemaField, mappedField }) => [
        schemaField,
        properties[mappedField],
      ])
    ),
  };
}
