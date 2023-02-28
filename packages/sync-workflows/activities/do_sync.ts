import { refreshAccessTokenIfNecessary } from '@supaglue/core/lib';
import { HubSpotClient, SalesforceClient } from '@supaglue/core/remotes';
import {
  AccountService,
  ConnectionService,
  ContactService,
  IntegrationService,
  LeadService,
  OpportunityService,
} from '@supaglue/core/services';
import { CommonModel, CRMConnection, Integration } from '@supaglue/core/types';
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
  async function doSalesforceSync(
    connection: CRMConnection,
    integration: Integration,
    commonModel: CommonModel,
    sessionId?: string
  ): Promise<void> {
    if (sessionId) {
      logEvent('Start Sync', 'salesforce', commonModel, sessionId);
    }

    const client = new SalesforceClient({
      instanceUrl: connection.credentials.instanceUrl,
      refreshToken: connection.credentials.refreshToken,
      clientId: integration.config.oauth.credentials.oauthClientId,
      clientSecret: integration.config.oauth.credentials.oauthClientSecret,
    });

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
      logEvent('Completed Sync', 'salesforce', commonModel, sessionId);
    }
  }

  async function doHubSpotSync(
    connection: CRMConnection,
    integration: Integration,
    commonModel: CommonModel,
    sessionId?: string
  ): Promise<void> {
    if (sessionId) {
      logEvent('Start Sync', 'hubspot', commonModel, sessionId);
    }

    const client = new HubSpotClient({
      accessToken: connection.credentials.accessToken,
      refreshToken: connection.credentials.refreshToken,
      clientId: integration.config.oauth.credentials.oauthClientId,
      clientSecret: integration.config.oauth.credentials.oauthClientSecret,
    });

    await refreshAccessTokenIfNecessary(connection.id, client, connectionService);

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
        // There are no leads in hubspot, so just do nothing.
        break;
      }
    }

    if (sessionId) {
      logEvent('Completed Sync', 'hubspot', commonModel, sessionId);
    }
  }

  return async function doSync({ connectionId, commonModel, sessionId }: DoSyncArgs): Promise<void> {
    // TODO: Use `remoteService` instead to get the client
    const connection = await connectionService.getById(connectionId);
    const integration = await integrationService.getById(connection.integrationId);

    switch (connection.providerName) {
      case 'salesforce':
        return await doSalesforceSync(connection, integration, commonModel, sessionId);
      case 'hubspot':
        return await doHubSpotSync(connection, integration, commonModel, sessionId);
    }
  };
}
