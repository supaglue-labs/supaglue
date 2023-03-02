import { RemoteAccount, RemoteAccountCreateParams, RemoteAccountUpdateParams } from '../../types/account';
import { CRMConnection } from '../../types/connection';
import { RemoteContact, RemoteContactCreateParams, RemoteContactUpdateParams } from '../../types/contact';
import { Integration } from '../../types/integration';
import { RemoteLead, RemoteLeadCreateParams, RemoteLeadUpdateParams } from '../../types/lead';
import {
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
  RemoteOpportunityUpdateParams,
} from '../../types/opportunity';
import { RemoteClient } from '../base';

interface CrmRemoteClientEvents {
  token_refreshed: (accessToken: string, expiresAt: string) => void;
}

export interface CrmRemoteClient extends RemoteClient {
  on<U extends keyof CrmRemoteClientEvents>(event: U, listener: CrmRemoteClientEvents[U]): this;

  listAccounts(): Promise<RemoteAccount[]>;
  createAccount(params: RemoteAccountCreateParams): Promise<RemoteAccount>;
  updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount>;

  listContacts(): Promise<RemoteContact[]>;
  createContact(params: RemoteContactCreateParams): Promise<RemoteContact>;
  updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact>;

  listLeads(): Promise<RemoteLead[]>;
  createLead(params: RemoteLeadCreateParams): Promise<RemoteLead>;
  updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead>;

  listOpportunities(): Promise<RemoteOpportunity[]>;
  createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity>;
  updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity>;
}

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
};

export type CrmConnectorConfig = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: CRMConnection, integration: Integration) => CrmRemoteClient;
};
