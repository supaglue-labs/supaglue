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

    switch (commonModel) {
      case 'account': {
        const readable = await client.listAccounts(updatedAfter);
        await writer.writeAccounts(connection, toHeartbeatingStream(readable), onUpsertBatchCompletion);
        break;
      }
      case 'contact': {
        const readable = await client.listContacts(updatedAfter);
        await writer.writeContacts(connection, toHeartbeatingStream(readable), onUpsertBatchCompletion);
        break;
      }
      case 'opportunity': {
        const readable = await client.listOpportunities(updatedAfter);
        await writer.writeOpportunities(connection, toHeartbeatingStream(readable), onUpsertBatchCompletion);
        break;
      }
      case 'lead': {
        const readable = await client.listLeads(updatedAfter);
        await writer.writeLeads(connection, toHeartbeatingStream(readable), onUpsertBatchCompletion);
        break;
      }
      case 'user': {
        const readable = await client.listUsers(updatedAfter);
        await writer.writeUsers(connection, toHeartbeatingStream(readable), onUpsertBatchCompletion);
        break;
      }
      case 'event': {
        const readable = await client.listEvents(updatedAfter);
        await writer.writeEvents(connection, toHeartbeatingStream(readable), onUpsertBatchCompletion);
        break;
      }
    }

    logEvent({
      eventName: 'Partially Completed Sync',
      syncId,
      providerName: connection.providerName,
      modelName: commonModel,
    });

    return {
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
