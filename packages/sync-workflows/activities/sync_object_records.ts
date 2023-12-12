import type { DestinationWriter } from '@supaglue/core/destination_writers/base';
import { shouldDeleteRecords } from '@supaglue/core/destination_writers/util';
import { getCategoryForProvider } from '@supaglue/core/remotes';
import type { ConnectionService, RemoteService, SyncConfigService } from '@supaglue/core/services';
import type { DestinationService } from '@supaglue/core/services/destination_service';
import type { CRMCommonObjectType } from '@supaglue/types/crm';
import type { EngagementCommonObjectType } from '@supaglue/types/engagement';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type {
  ListedObjectRecord,
  MappedListedObjectRecord,
  PropertiesWithAdditionalFields,
} from '@supaglue/types/object_record';
import { ApplicationFailure, Context } from '@temporalio/activity';
import type { Readable } from 'stream';
import { pipeline, Transform } from 'stream';
import type { SyncService } from '../services';

export type SyncObjectRecordsArgs = {
  syncId: string;
  connectionId: string;
  objectType: 'common' | 'standard' | 'custom';
  object: string;
  updatedAfterMs?: number;
};

export type SyncObjectRecordsResult = {
  syncId: string;
  connectionId: string;
  objectType: 'common' | 'standard' | 'custom';
  object: string;
  maxLastModifiedAtMs: number | null;
  numRecordsSynced: number;
};

export function createSyncObjectRecords(
  connectionService: ConnectionService,
  remoteService: RemoteService,
  destinationService: DestinationService,
  syncService: SyncService,
  syncConfigService: SyncConfigService
) {
  return async function syncObjectRecords({
    syncId,
    connectionId,
    objectType,
    object,
    updatedAfterMs,
  }: SyncObjectRecordsArgs): Promise<SyncObjectRecordsResult> {
    const sync = await syncService.getSyncById(syncId);
    const syncConfig = await syncConfigService.getById(sync.syncConfigId);
    const connection = await connectionService.getSafeById(connectionId);
    // Find associations to fetch
    let associationsToFetch: string[] | undefined = undefined;
    if (connection.providerName === 'hubspot') {
      switch (objectType) {
        case 'common':
          associationsToFetch = syncConfig.config.commonObjects?.find((config) => config.object === object)
            ?.associationsToFetch;
          break;
        case 'standard':
          associationsToFetch = syncConfig.config.standardObjects?.find((config) => config.object === object)
            ?.associationsToFetch;
          break;
        case 'custom':
          associationsToFetch = syncConfig.config.customObjects?.find((config) => config.object === object)
            ?.associationsToFetch;
          break;
        default:
          break;
      }
    }

    async function writeObjects(writer: DestinationWriter) {
      switch (objectType) {
        case 'common':
          {
            const category = getCategoryForProvider(connection.providerName);
            switch (category) {
              case 'crm': {
                if (connection.providerName === 'hubspot' && object === 'lead') {
                  return {
                    syncId,
                    connectionId,
                    objectType,
                    object,
                    maxLastModifiedAt: null,
                    numRecords: 0,
                  };
                }
                const [client] = await remoteService.getCrmRemoteClient(connectionId);
                const fieldMappingConfig = await connectionService.getFieldMappingConfig(
                  connectionId,
                  'common',
                  object
                );
                const readable = await client.streamCommonObjectRecords(
                  object as CRMCommonObjectType,
                  fieldMappingConfig,
                  updatedAfter,
                  heartbeat,
                  associationsToFetch
                );
                return await writer.writeCommonObjectRecords(
                  connection,
                  object as CRMCommonObjectType,
                  readable,
                  heartbeat,
                  /* diffAndDeleteRecords */ shouldDeleteRecords(!updatedAfterMs, connection.providerName)
                );
              }
              case 'engagement': {
                const [client] = await remoteService.getEngagementRemoteClient(connectionId);
                const readable = await client.streamCommonObjectRecords(
                  object as EngagementCommonObjectType,
                  updatedAfter,
                  heartbeat
                );
                return await writer.writeCommonObjectRecords(
                  connection,
                  object as EngagementCommonObjectType,
                  readable,
                  heartbeat,
                  /* diffAndDeleteRecords */ shouldDeleteRecords(!updatedAfterMs, connection.providerName)
                );
              }
              case 'enrichment':
              case 'marketing_automation':
              case 'no_category': {
                throw ApplicationFailure.nonRetryable(
                  `Common objects not supported for provider ${connection.providerName}`
                );
              }
            }
          }
          break;
        case 'standard':
          {
            const client = await remoteService.getRemoteClient(connectionId);
            const fieldMappingConfig = await connectionService.getFieldMappingConfig(connectionId, 'standard', object);
            const fieldsToFetch = getFieldsToFetch(fieldMappingConfig);
            const stream = await client.streamStandardObjectRecords(
              object,
              fieldsToFetch,
              updatedAfter,
              heartbeat,
              associationsToFetch
            );
            return await writer.writeObjectRecords(
              connection,
              object,
              toMappedPropertiesReadable(stream, fieldMappingConfig),
              heartbeat,
              /* diffAndDeleteRecords */ shouldDeleteRecords(!updatedAfterMs, connection.providerName),
              'standard'
            );
          }
          break;
        case 'custom':
          {
            const client = await remoteService.getRemoteClient(connectionId);
            const fieldMappingConfig = {
              type: 'inherit_all_fields' as const,
            };
            const fieldsToFetch = getFieldsToFetch(fieldMappingConfig);
            const stream = await client.streamCustomObjectRecords(
              object,
              fieldsToFetch,
              updatedAfter,
              heartbeat,
              associationsToFetch
            );
            return await writer.writeObjectRecords(
              connection,
              object,
              toMappedPropertiesReadable(stream, fieldMappingConfig),
              heartbeat,
              /* diffAndDeleteRecords */ shouldDeleteRecords(!updatedAfterMs, connection.providerName),
              'custom'
            );
          }
          break;
      }
    }

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
        objectType,
        object,
        maxLastModifiedAtMs: result.maxLastModifiedAt ? result.maxLastModifiedAt.getTime() : null,
        numRecordsSynced: result.numRecords,
      };
    } catch (e: any) {
      if (e.problemType === 'SG_TERMINAL_TOO_MANY_REQUESTS_ERROR') {
        throw ApplicationFailure.nonRetryable(e.message);
      }
      throw e;
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

function heartbeat() {
  Context.current().heartbeat();
}
