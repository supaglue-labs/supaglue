import { CrmRemoteClient } from '@supaglue/core/remotes/crm/base';
import { EngagementRemoteClient } from '@supaglue/core/remotes/engagement/base';
import { ConnectionService, RemoteService } from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import { CommonModel } from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
import { Context } from '@temporalio/activity';
import { pipeline, Readable, Transform } from 'stream';
import { logEvent } from '../lib/analytics';

export type SyncRecordsToDestinationArgs = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModel;
  updatedAfterMs?: number;
};

export type SyncRecordsToDestinationResult = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModel;
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
    const connection = await connectionService.getSafeById(connectionId);

    const result = {
      maxLastModifiedAt: null as Date | null,
      numRecords: 0,
    };

    logEvent({ eventName: 'Start Sync', syncId, providerName: connection.providerName, modelName: commonModel });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    const client = await remoteService.getRemoteClient(connectionId);

    const writer = await destinationService.getWriterByApplicationId(connection.applicationId);

    let readable: Readable;
    // TODO: Have better type-safety
    if (client.category() === 'crm') {
      readable = await (client as CrmRemoteClient).listObjects(
        commonModel as CRMCommonModelType,
        updatedAfter,
        heartbeat
      );
      await writer.writeObjects(
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
      await writer.writeObjects(
        connection,
        commonModel as EngagementCommonModelType,
        toHeartbeatingReadable(readable),
        onUpsertBatchCompletion
      );
    }

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
