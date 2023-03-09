import { EventEmitter } from 'events';
import { Readable } from 'stream';
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
  newClient: (connection: CRMConnection, integration: Integration) => CrmRemoteClient;
};
