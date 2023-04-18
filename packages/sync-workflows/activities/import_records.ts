import {
  AccountService,
  ConnectionService,
  ContactService,
  EventService,
  LeadService,
  OpportunityService,
  RemoteService,
  UserService,
} from '@supaglue/core/services';
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
  accountService: AccountService,
  connectionService: ConnectionService,
  contactService: ContactService,
  remoteService: RemoteService,
  opportunityService: OpportunityService,
  leadService: LeadService,
  userService: UserService,
  eventService: EventService
) {
  return async function importRecords({
    syncId,
    connectionId,
    commonModel,
    updatedAfterMs,
  }: ImportRecordsArgs): Promise<ImportRecordsResult> {
    const connection = await connectionService.getSafeById(connectionId);
    const client = await remoteService.getCrmRemoteClient(connectionId);

    let result = {
      maxLastModifiedAt: null as Date | null,
      numRecords: 0,
    };

    logEvent({ eventName: 'Start Sync', syncId, providerName: connection.providerName, modelName: commonModel });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    switch (commonModel) {
      case 'account': {
        const readable = await client.listAccounts(updatedAfter);
        result = await accountService.upsertRemoteAccounts(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'contact': {
        const readable = await client.listContacts(updatedAfter);
        result = await contactService.upsertRemoteContacts(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'opportunity': {
        const readable = await client.listOpportunities(updatedAfter);
        result = await opportunityService.upsertRemoteOpportunities(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'lead': {
        const readable = await client.listLeads(updatedAfter);
        result = await leadService.upsertRemoteLeads(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'user': {
        const readable = await client.listUsers(updatedAfter);
        result = await userService.upsertRemoteUsers(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'event': {
        const readable = await client.listEvents(updatedAfter);
        result = await eventService.upsertRemoteEvents(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
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

function onUpsertBatchCompletion(offset: number, numRecords: number) {
  Context.current().heartbeat();
}
