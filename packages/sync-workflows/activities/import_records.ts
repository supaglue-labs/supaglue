import { CrmRemoteClient } from '@supaglue/core/remotes/crm/base';
import { ConnectionService, RemoteService } from '@supaglue/core/services';
import {
  AccountService,
  ContactService,
  EventService,
  LeadService,
  OpportunityService,
  UserService,
} from '@supaglue/core/services/common_models/crm';
import { CommonModel } from '@supaglue/types';
import { ApplicationFailure, Context } from '@temporalio/activity';
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

    if (connection.category !== 'crm') {
      // TODO: support non-CRM syncs
      throw ApplicationFailure.nonRetryable('Only CRM connections are supported');
    }

    const client = (await remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;

    let result = {
      maxLastModifiedAt: null as Date | null,
      numRecords: 0,
    };

    logEvent({ eventName: 'Start Sync', syncId, providerName: connection.providerName, modelName: commonModel });

    const updatedAfter = updatedAfterMs ? new Date(updatedAfterMs) : undefined;

    const readable = await client.listObjects(commonModel, updatedAfter);

    switch (commonModel) {
      case 'account': {
        result = await accountService.upsertRemoteAccounts(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'contact': {
        result = await contactService.upsertRemoteContacts(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'opportunity': {
        result = await opportunityService.upsertRemoteOpportunities(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'lead': {
        result = await leadService.upsertRemoteLeads(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'user': {
        result = await userService.upsertRemoteUsers(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable),
          onUpsertBatchCompletion
        );
        break;
      }
      case 'event': {
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

function onUpsertBatchCompletion(offset: number, numRecords: number) {
  Context.current().heartbeat();
}
