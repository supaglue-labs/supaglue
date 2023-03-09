import {
  AccountService,
  ConnectionService,
  ContactService,
  LeadService,
  OpportunityService,
  RemoteService,
} from '@supaglue/core/services';
import { CommonModel } from '@supaglue/core/types';
import { logEvent } from '../lib/analytics';

export type DoSyncArgs = {
  connectionId: string;
  commonModel: CommonModel;
  sessionId?: string;
};

export function createDoSync(
  accountService: AccountService,
  connectionService: ConnectionService,
  contactService: ContactService,
  remoteService: RemoteService,
  opportunityService: OpportunityService,
  leadService: LeadService
) {
  return async function doSync({ connectionId, commonModel, sessionId }: DoSyncArgs): Promise<void> {
    const connection = await connectionService.getById(connectionId);
    const client = await remoteService.getCrmRemoteClient(connectionId);

    if (sessionId) {
      logEvent('Start Sync', connection.providerName, commonModel, sessionId);
    }

    switch (commonModel) {
      case 'account': {
        const remoteAccounts = await client.listAccounts();
        await accountService.upsertRemoteAccounts(connection.id, connection.customerId, remoteAccounts);
        break;
      }
      case 'contact': {
        const remoteContacts = await client.listContacts();
        await contactService.upsertRemoteContacts(connection.id, connection.customerId, remoteContacts);
        break;
      }
      case 'opportunity': {
        const remoteOpportunities = await client.listOpportunities();
        await opportunityService.upsertRemoteOpportunities(connection.id, connection.customerId, remoteOpportunities);
        break;
      }
      case 'lead': {
        const remoteLeads = await client.listLeads();
        await leadService.upsertRemoteLeads(connection.id, connection.customerId, remoteLeads);
        break;
      }
    }

    if (sessionId) {
      logEvent('Completed Sync', connection.providerName, commonModel, sessionId);
    }
  };
}
