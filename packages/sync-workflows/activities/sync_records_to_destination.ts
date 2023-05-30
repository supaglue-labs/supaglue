import { DestinationWriter } from '@supaglue/core/destination_writers/base';
import { CrmRemoteClient } from '@supaglue/core/remotes/crm/base';
import { EngagementRemoteClient } from '@supaglue/core/remotes/engagement/base';
import { ConnectionService, RemoteService } from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import { CommonModelType } from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
import { Context } from '@temporalio/activity';
import { pipeline, Readable, Transform } from 'stream';
import { logEvent } from '../lib/analytics';

export type SyncRecordsToDestinationArgs = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModelType;
  updatedAfterMs?: number;
};

export type SyncRecordsToDestinationResult = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModelType;
  maxLastModifiedAtMs: number;
  numRecordsSynced: number;
};

export function createSyncRecordsToDestination(
  connectionService: ConnectionService,
  remoteService: RemoteService,
  destinationService: DestinationService
) {
  return async function syncRecordsToDestination({
    syncId,
    connectionId,
    commonModel,
    updatedAfterMs,
  }: SyncRecordsToDestinationArgs): Promise<SyncRecordsToDestinationResult> {
    async function writeObjects(writer: DestinationWriter) {
      let readable: Readable;
      // TODO: Have better type-safety
      if (client.category() === 'crm') {
        readable = await (client as CrmRemoteClient).listObjects(
          commonModel as CRMCommonModelType,
          updatedAfter,
          heartbeat
        );
        return await writer.writeObjects(
          connection,
          commonModel as CRMCommonModelType,
          toHeartbeatingReadable(readable),
          heartbeat
        );
      } else {
        readable = await (client as EngagementRemoteClient).listObjects(
          commonModel as EngagementCommonModelType,
          updatedAfter
        );
        return await writer.writeObjects(
          connection,
          commonModel as EngagementCommonModelType,
          toHeartbeatingReadable(readable),
          heartbeat
        );
      }
    }

    const connection = await connectionService.getSafeById(connectionId);

    logEvent({ eventName: 'Start Sync', syncId, providerName: connection.providerName, modelName: commonModel });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    const client = await remoteService.getRemoteClient(connectionId);

    const writer = await destinationService.getWriterByIntegrationId(connection.integrationId);
    if (!writer) {
      throw new Error(`No destination found for integration ${connection.integrationId}`);
    }

    const result = await writeObjects(writer);

    logEvent({
      eventName: 'Partially Completed Sync',
      syncId,
      providerName: connection.providerName,
      modelName: commonModel,
    });

    return {
      syncId,
      connectionId,
      commonModel,
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
