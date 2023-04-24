import { ConnectionService, RemoteService } from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import { CommonModel } from '@supaglue/types';
import { Context } from '@temporalio/activity';
import { pipeline, Readable, Transform } from 'stream';
import { logEvent } from '../lib/analytics';

export type ImportRecordsArgs = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModel;
  updatedAfterMs?: number;
};

export type ImportRecordsResult = {
  syncId: string;
  connectionId: string;
  commonModel: CommonModel;
  maxLastModifiedAtMs: number;
  numRecordsSynced: number;
};

export function createImportRecords(
  connectionService: ConnectionService,
  remoteService: RemoteService,
  destinationService: DestinationService
) {
  return async function importRecords({
    syncId,
    connectionId,
    commonModel,
    updatedAfterMs,
  }: ImportRecordsArgs): Promise<ImportRecordsResult> {
    const connection = await connectionService.getSafeById(connectionId);
    const client = await remoteService.getCrmRemoteClient(connectionId);
    const writer = await destinationService.getWriterByApplicationId(connection.applicationId);

    const result = {
      maxLastModifiedAt: null as Date | null,
      numRecords: 0,
    };

    logEvent({ eventName: 'Start Sync', syncId, providerName: connection.providerName, modelName: commonModel });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;
    const readable = await client.listObjects(commonModel, updatedAfter);
    await writer.writeObjects(connection, commonModel, toHeartbeatingStream(readable), onUpsertBatchCompletion);

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

function toHeartbeatingStream(stream: Readable) {
  // TODO: While this ensures rescheduling of this activity if the process dies,
  // it does not ensure that we stop the stream processing.
  // We need to include a timeout here to clean up the pipeline when we
  // exceed the heartbeat timeout.
  return pipeline(
    stream,
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

function onUpsertBatchCompletion(offset: number, numRecords: number) {
  Context.current().heartbeat();
}
