import {
  AccountService,
  ConnectionService,
  ContactService,
  LeadService,
  OpportunityService,
  RemoteService,
  UserService,
} from '@supaglue/core/services';
import { CommonModel } from '@supaglue/core/types';
import { Context } from '@temporalio/activity';
import { pipeline, Readable, Transform } from 'stream';
import { logEvent } from '../lib/analytics';

export type DoSyncArgs = {
  connectionId: string;
  commonModel: CommonModel;
};

export type DoSyncResult = {
  numRecordsSynced: number;
};

export function createDoSync(
  accountService: AccountService,
  connectionService: ConnectionService,
  contactService: ContactService,
  remoteService: RemoteService,
  opportunityService: OpportunityService,
  leadService: LeadService,
  userService: UserService
) {
  return async function doSync({ connectionId, commonModel }: DoSyncArgs): Promise<DoSyncResult> {
    const connection = await connectionService.getById(connectionId);
    const client = await remoteService.getCrmRemoteClient(connectionId);

    let numRecordsSynced = 0;

    logEvent('Start Sync', connection.providerName, commonModel);

    switch (commonModel) {
      case 'account': {
        const readable = await client.listAccounts();
        numRecordsSynced = await accountService.upsertRemoteAccounts(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable)
        );
        break;
      }
      case 'contact': {
        const readable = await client.listContacts();
        numRecordsSynced = await contactService.upsertRemoteContacts(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable)
        );
        break;
      }
      case 'opportunity': {
        const readable = await client.listOpportunities();
        numRecordsSynced = await opportunityService.upsertRemoteOpportunities(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable)
        );
        break;
      }
      case 'lead': {
        const readable = await client.listLeads();
        numRecordsSynced = await leadService.upsertRemoteLeads(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable)
        );
        break;
      }
      case 'user': {
        const readable = await client.listUsers();
        numRecordsSynced = await userService.upsertRemoteUsers(
          connection.id,
          connection.customerId,
          toHeartbeatingReadable(readable)
        );
        break;
      }
    }

    logEvent('Completed Sync', connection.providerName, commonModel);

    return {
      numRecordsSynced,
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
