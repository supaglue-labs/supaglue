import type { DestinationWriter } from '@supaglue/core/destination_writers/base';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
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
import { logEvent } from '../lib/analytics';
import type { ApplicationService, SyncService } from '../services';

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
  syncConfigService: SyncConfigService,
  applicationService: ApplicationService
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

    async function writeObjects(writer: DestinationWriter) {
      switch (objectType) {
        case 'common':
          {
            const category = getCategoryForProvider(connection.providerName);
            switch (category) {
              case 'crm': {
                const [client] = await remoteService.getCrmRemoteClient(connectionId);
                const fieldMappingConfig = await connectionService.getFieldMappingConfig(
                  connectionId,
                  'common',
                  object
                );
                const readable = await client.listCommonObjectRecords(
                  object as CRMCommonObjectType,
                  fieldMappingConfig,
                  updatedAfter,
                  heartbeat
                );
                return await writer.writeCommonObjectRecords(
                  connection,
                  object as CRMCommonObjectType,
                  toHeartbeatingReadable(readable),
                  heartbeat,
                  /* isFullSync */ !updatedAfterMs
                );
              }
              case 'engagement': {
                const [client] = await remoteService.getEngagementRemoteClient(connectionId);
                const readable = await client.listCommonObjectRecords(
                  object as EngagementCommonObjectType,
                  updatedAfter,
                  heartbeat
                );
                return await writer.writeCommonObjectRecords(
                  connection,
                  object as EngagementCommonObjectType,
                  toHeartbeatingReadable(readable),
                  heartbeat,
                  /* isFullSync */ !updatedAfterMs
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
            const stream = await client.listStandardObjectRecords(object, fieldsToFetch, updatedAfter, heartbeat);
            return await writer.writeObjectRecords(
              connection,
              object,
              toHeartbeatingReadable(toMappedPropertiesReadable(stream, fieldMappingConfig)),
              heartbeat,
              /* isFullSync */ !updatedAfterMs
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
            const stream = await client.listCustomObjectRecords(object, fieldsToFetch, updatedAfter, heartbeat);
            return await writer.writeObjectRecords(
              connection,
              object,
              toHeartbeatingReadable(toMappedPropertiesReadable(stream, fieldMappingConfig)),
              heartbeat,
              /* isFullSync */ !updatedAfterMs
            );
          }
          break;
      }
    }

    const application = await applicationService.getById(connection.applicationId);

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Start Sync',
      syncId,
      providerName: connection.providerName,
      modelName: object,
    });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    const writer = await destinationService.getWriterByDestinationId(syncConfig.destinationId);
    if (!writer) {
      throw ApplicationFailure.nonRetryable(`No destination found for id ${syncConfig.destinationId}`);
    }

    const result = await writeObjects(writer);

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Partially Completed Sync',
      syncId: syncId,
      providerName: connection.providerName,
      modelName: object,
    });

    return {
      syncId: syncId,
      connectionId,
      objectType,
      object,
      maxLastModifiedAtMs: result.maxLastModifiedAt ? result.maxLastModifiedAt.getTime() : null,
      numRecordsSynced: result.numRecords,
    };
  };
}

function toHeartbeatingReadable(readable: Readable): Readable {
  // TODO: While this ensures rescheduling of this activity if the process dies,
  // it does not ensure that we stop the stream processing.
  // We need to include a timeout here to clean up the pipeline when we
  // exceed the heartbeat timeout.
  return pipeline(
    readable,
    new Transform({
      objectMode: true,
      transform: (chunk, encoding, callback) => {
        Context.current().heartbeat();
        try {
          callback(null, chunk);
        } catch (e: any) {
          return callback(e);
        }
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    () => {}
  );
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
