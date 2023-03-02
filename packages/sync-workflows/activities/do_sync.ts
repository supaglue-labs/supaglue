import { getCrmRemoteClient } from '@supaglue/core/remotes/crm';
import {
  AccountService,
  ConnectionService,
  ContactService,
  IntegrationService,
  LeadService,
  OpportunityService,
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
  integrationService: IntegrationService,
  opportunityService: OpportunityService,
  leadService: LeadService
) {
  return async function doSync({ connectionId, commonModel, sessionId }: DoSyncArgs): Promise<void> {
    const connection = await connectionService.getById(connectionId);
    const integration = await integrationService.getById(connection.integrationId);

    if (sessionId) {
      logEvent('Start Sync', connection.providerName, commonModel, sessionId);
    }

    const client = getCrmRemoteClient(connection, integration);

    switch (commonModel) {
      case 'account': {
        const remoteAccounts = await client.listAccounts();
        const accountSyncUpsertParams = remoteAccounts.map((remoteAccount) => ({
          customerId: connection.customerId,
          connectionId: connection.id,
          ...remoteAccount,
        }));
        await accountService.upsertRemoteAccounts(connection.id, accountSyncUpsertParams);
        break;
      }
      case 'contact': {
        const remoteContacts = await client.listContacts();
        const contactSyncUpsertParams = remoteContacts.map((remoteContact) => ({
          customerId: connection.customerId,
          connectionId: connection.id,
          ...remoteContact,
        }));
        await contactService.upsertRemoteContacts(connection.id, contactSyncUpsertParams);
        break;
      }
      case 'opportunity': {
        const remoteOpportunities = await client.listOpportunities();
        const opportunitySyncUpsertParams = remoteOpportunities.map((remoteOpportunity) => ({
          customerId: connection.customerId,
          connectionId: connection.id,
          ...remoteOpportunity,
        }));
        await opportunityService.upsertRemoteOpportunities(connection.id, opportunitySyncUpsertParams);
        break;
      }
      case 'lead': {
        const remoteLeads = await client.listLeads();
        const leadSyncUpsertParams = remoteLeads.map((remoteLead) => ({
          customerId: connection.customerId,
          connectionId: connection.id,
          ...remoteLead,
        }));
        await leadService.upsertRemoteLeads(connection.id, leadSyncUpsertParams);
        break;
      }
    }

    if (sessionId) {
      logEvent('Completed Sync', connection.providerName, commonModel, sessionId);
    }
  };
}
