import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { CRMConnectionUnsafe } from '../../types/connection';
import {
  RemoteAccount,
  RemoteAccountCreateParams,
  RemoteAccountUpdateParams,
  RemoteContact,
  RemoteContactCreateParams,
  RemoteContactUpdateParams,
  RemoteLead,
  RemoteLeadCreateParams,
  RemoteLeadUpdateParams,
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
  RemoteOpportunityUpdateParams,
} from '../../types/crm';
import { CompleteIntegration } from '../../types/integration';
import { RemoteClient } from '../base';

interface CrmRemoteClientEvents {
  token_refreshed: (accessToken: string, expiresAt: string | null) => void;
}

export interface CrmRemoteClient extends RemoteClient {
  on<U extends keyof CrmRemoteClientEvents>(event: U, listener: CrmRemoteClientEvents[U]): this;

  listAccounts(): Promise<Readable>; // streams RemoteAccount
  createAccount(params: RemoteAccountCreateParams): Promise<RemoteAccount>;
  updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount>;

  listContacts(): Promise<Readable>; // streams RemoteContact
  createContact(params: RemoteContactCreateParams): Promise<RemoteContact>;
  updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact>;

  listLeads(): Promise<Readable>; // streams RemoteLead
  createLead(params: RemoteLeadCreateParams): Promise<RemoteLead>;
  updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead>;

  listOpportunities(): Promise<Readable>; // streams RemoteOpportunity
  createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity>;
  updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity>;

  // Note: User creation/updates are not supported
  listUsers(): Promise<Readable>; // streams RemoteUser
}

export abstract class CrmRemoteClientEventEmitter extends EventEmitter {
  public emit<U extends keyof CrmRemoteClientEvents>(event: U, ...args: Parameters<CrmRemoteClientEvents[U]>): boolean {
    return super.emit(event, ...args);
  }
}

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
};

export type CrmConnectorConfig = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: CRMConnectionUnsafe, integration: CompleteIntegration) => CrmRemoteClient;
};
