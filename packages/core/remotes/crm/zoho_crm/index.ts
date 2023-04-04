import {
  AccountCreateParams,
  CRMConnectionUnsafe,
  Integration,
  RemoteAccount,
  RemoteAccountUpdateParams,
  RemoteContact,
  RemoteContactCreateParams,
  RemoteContactUpdateParams,
  RemoteEvent,
  RemoteEventCreateParams,
  RemoteEventUpdateParams,
  RemoteLead,
  RemoteLeadCreateParams,
  RemoteLeadUpdateParams,
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
  RemoteOpportunityUpdateParams,
} from '@supaglue/types';
import { Readable } from 'stream';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';

class ZohoCrmClient extends AbstractCrmRemoteClient {
  public constructor() {
    // TODO: Support baseUrl
    super('missing-base-url');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
  }

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

  public async listEvents(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getEvent(remoteId: string): Promise<RemoteEvent> {
    throw new Error('Not implemented');
  }

  public async createEvent(params: RemoteEventCreateParams): Promise<RemoteEvent> {
    throw new Error('Not implemented');
  }

  public async updateEvent(params: RemoteEventUpdateParams): Promise<RemoteEvent> {
    throw new Error('Not implemented');
  }
}

// TODO: We should pass in a type-narrowed CRMConnection
export function newClient(connection: CRMConnectionUnsafe, integration: Integration): ZohoCrmClient {
  return new ZohoCrmClient();
}

// TODO: support other geographies
export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://accounts.zoho.com',
  tokenPath: '/oauth/v2/token',
  authorizeHost: 'https://accounts.zoho.com',
  authorizePath: '/oauth/v2/auth',
};
