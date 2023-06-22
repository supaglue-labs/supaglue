import { DestinationWriter } from '@supaglue/core/destination_writers/base';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { createFieldMappingConfig } from '@supaglue/core/lib/schema';
import { CrmRemoteClient } from '@supaglue/core/remotes/crm/base';
import { ConnectionService, RemoteService, SyncConfigService } from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import { ApplicationFailure, Context } from '@temporalio/activity';
import { pipeline, Readable, Transform } from 'stream';
import { logEvent } from '../lib/analytics';
import { ApplicationService, SyncService } from '../services';

export type SyncRawRecordsToDestinationArgs = {
  syncId: string;
  connectionId: string;
  object: string;
  isCustom: boolean;
  modifiedAfterMs?: number;
};

export type SyncRawRecordsToDestinationResult = {
  syncId: string;
  connectionId: string;
  object: string;
  maxLastModifiedAtMs: number;
  numRecordsSynced: number;
};

export function createSyncRawRecordsToDestination(
  connectionService: ConnectionService,
  remoteService: RemoteService,
  destinationService: DestinationService,
  applicationService: ApplicationService,
  syncService: SyncService,
  syncConfigService: SyncConfigService
) {
  return async function syncRawRecordsToDestination({
    syncId,
    connectionId,
    object,
    isCustom,
    modifiedAfterMs,
  }: SyncRawRecordsToDestinationArgs): Promise<SyncRawRecordsToDestinationResult> {
    const modifiedAfter = modifiedAfterMs ? new Date(modifiedAfterMs) : undefined;

    const connection = await connectionService.getSafeById(connectionId);
    const application = await applicationService.getById(connection.applicationId);

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Start Sync',
      syncId,
      providerName: connection.providerName,
      modelName: object,
    });

    // Get writer
    const client = await remoteService.getRemoteClient(connectionId);
    const writer = await destinationService.getWriterByProviderId(connection.providerId);
    if (!writer) {
      throw ApplicationFailure.nonRetryable(`No destination found for provider ${connection.providerId}`);
    }

    const result = await (async function (writer: DestinationWriter) {
      // TODO: Have better type-safety
      if (client.category() === 'crm') {
        const stream = isCustom
          ? await (client as CrmRemoteClient).listCustomObjectRecords(object, modifiedAfter, heartbeat)
          : await (async function () {
              // Find schema / field mapping information
              const sync = await syncService.getSyncById(syncId);
              const syncConfig = await syncConfigService.getBySyncId(syncId);
              const schema = syncConfig?.config?.standardObjects?.find((o) => o.object === object)?.schema;
              const customerFieldMapping = sync.schemaMappingsConfig?.standardObjects?.find(
                (o) => o.object === object
              )?.fieldMappings;
              const fieldMappingConfig = createFieldMappingConfig(schema, customerFieldMapping);
              return await (client as CrmRemoteClient).listStandardObjectRecords(
                object,
                fieldMappingConfig,
                modifiedAfter,
                heartbeat
              );
            })();
        return await writer.writeObjectRecords(connection, object, toHeartbeatingReadable(stream), heartbeat);
      } else {
        throw ApplicationFailure.nonRetryable('Syncing standard and custom objects only supported for crm category');
      }
    })(writer);

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Partially Completed Sync',
      syncId,
      providerName: connection.providerName,
      modelName: object,
    });

    return {
      syncId,
      connectionId,
      object,
      maxLastModifiedAtMs: result.maxLastModifiedAt ? result.maxLastModifiedAt.getTime() : 0,
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

function heartbeat() {
  Context.current().heartbeat();
}
