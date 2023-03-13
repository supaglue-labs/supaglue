import { Readable } from 'stream';
import {
  AccountCreateParams,
  CRMConnection,
  Integration,
  RemoteAccount,
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
  RemoteUser,
  RemoteUserCreateParams,
  RemoteUserUpdateParams,
} from '../../../types';
import { ConnectorAuthConfig, CrmRemoteClient, CrmRemoteClientEventEmitter } from '../base';

class ZendeskSellClient extends CrmRemoteClientEventEmitter implements CrmRemoteClient {
  public async listAccounts(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getAccount(remoteId: string): Promise<RemoteAccount> {
    throw new Error('Not implemented');
  }

  public async createAccount(params: AccountCreateParams): Promise<RemoteAccount> {
    throw new Error('Not implemented');
  }

  public async updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount> {
    throw new Error('Not implemented');
  }

  public async listContacts(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getContact(remoteId: string): Promise<RemoteContact> {
    throw new Error('Not implemented');
  }

  public async createContact(params: RemoteContactCreateParams): Promise<RemoteContact> {
    throw new Error('Not implemented');
  }

  public async updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact> {
    throw new Error('Not implemented');
  }

  public async listOpportunities(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getOpportunity(remoteId: string): Promise<RemoteOpportunity> {
    throw new Error('Not implemented');
  }

  public async createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity> {
    throw new Error('Not implemented');
  }

  public async updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity> {
    throw new Error('Not implemented');
  }

  public async listLeads(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getLead(remoteId: string): Promise<RemoteLead> {
    throw new Error('Not implemented');
  }

  public async createLead(params: RemoteLeadCreateParams): Promise<RemoteLead> {
    throw new Error('Not implemented');
  }

  public async updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead> {
    throw new Error('Not implemented');
  }

  public async listUsers(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getUser(remoteId: string): Promise<RemoteUser> {
    throw new Error('Not implemented');
  }

  public async createUser(params: RemoteUserCreateParams): Promise<RemoteUser> {
    throw new Error('Not implemented');
  }

  public async updateUser(params: RemoteUserUpdateParams): Promise<RemoteUser> {
    throw new Error('Not implemented');
  }
}

// TODO: We should pass in a type-narrowed CRMConnection
export function newClient(connection: CRMConnection, integration: Integration): ZendeskSellClient {
  return new ZendeskSellClient();
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.getbase.com',
  tokenPath: '/oauth2/token',
  authorizeHost: 'https://api.getbase.com',
  authorizePath: '/oauth2/authorize',
};
