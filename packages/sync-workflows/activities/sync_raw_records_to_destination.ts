import { DestinationWriter } from '@supaglue/core/destination_writers/base';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { CrmRemoteClient } from '@supaglue/core/remotes/crm/base';
import { ConnectionService, RemoteService } from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import { ApplicationFailure, Context } from '@temporalio/activity';
import { pipeline, Readable, Transform } from 'stream';
import { logEvent } from '../lib/analytics';
import { ApplicationService } from '../services';

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
  applicationService: ApplicationService
) {
  return async function syncRawRecordsToDestination({
    syncId,
    connectionId,
    object,
    isCustom,
    modifiedAfterMs,
  }: SyncRawRecordsToDestinationArgs): Promise<SyncRawRecordsToDestinationResult> {
    const modifiedAfter = modifiedAfterMs ? new Date(modifiedAfterMs) : undefined;

    async function writeRecords(writer: DestinationWriter) {
      // TODO: Have better type-safety
      if (client.category() === 'crm') {
        const stream = isCustom
          ? await (client as CrmRemoteClient).listCustomRecords(object, modifiedAfter, heartbeat)
          : await (client as CrmRemoteClient).listRecords(object, modifiedAfter, heartbeat);
        return await writer.writeRawRecords(connection, object, toHeartbeatingReadable(stream), heartbeat);
      } else {
        throw ApplicationFailure.nonRetryable(`Unsupported category: ${client.category()}`);
      }
    }

    const connection = await connectionService.getSafeById(connectionId);
    const application = await applicationService.getById(connection.applicationId);

    logEvent({
      distinctId: distinctId ?? application.orgId,
      eventName: 'Start Sync',
      syncId,
      providerName: connection.providerName,
      modelName: object,
    });

    const client = await remoteService.getRemoteClient(connectionId);

    const writer = await destinationService.getWriterByProviderId(connection.providerId);
    if (!writer) {
      throw ApplicationFailure.nonRetryable(`No destination found for provider ${connection.providerId}`);
    }

    const result = await writeRecords(writer);

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
