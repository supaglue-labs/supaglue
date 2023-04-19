import {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  ConnectionUnsafe,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  Event,
  EventCreateParams,
  EventUpdateParams,
  Integration,
  Lead,
  LeadCreateParams,
  LeadUpdateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityUpdateParams,
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

  public async getAccount(remoteId: string): Promise<Account> {
    throw new Error('Not implemented');
  }

  public async createAccount(params: AccountCreateParams): Promise<Account> {
    throw new Error('Not implemented');
  }

  public async updateAccount(params: AccountUpdateParams): Promise<Account> {
    throw new Error('Not implemented');
  }

  public async listContacts(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getContact(remoteId: string): Promise<Contact> {
    throw new Error('Not implemented');
  }

  public async createContact(params: ContactCreateParams): Promise<Contact> {
    throw new Error('Not implemented');
  }

  public async updateContact(params: ContactUpdateParams): Promise<Contact> {
    throw new Error('Not implemented');
  }

  public async listOpportunities(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getOpportunity(remoteId: string): Promise<Opportunity> {
    throw new Error('Not implemented');
  }

  public async createOpportunity(params: OpportunityCreateParams): Promise<Opportunity> {
    throw new Error('Not implemented');
  }

  public async updateOpportunity(params: OpportunityUpdateParams): Promise<Opportunity> {
    throw new Error('Not implemented');
  }

  public async listLeads(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getLead(remoteId: string): Promise<Lead> {
    throw new Error('Not implemented');
  }

  public async createLead(params: LeadCreateParams): Promise<Lead> {
    throw new Error('Not implemented');
  }

  public async updateLead(params: LeadUpdateParams): Promise<Lead> {
    throw new Error('Not implemented');
  }

  public async listUsers(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async listEvents(): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async getEvent(remoteId: string): Promise<Event> {
    throw new Error('Not implemented');
  }

  public async createEvent(params: EventCreateParams): Promise<Event> {
    throw new Error('Not implemented');
  }

  public async updateEvent(params: EventUpdateParams): Promise<Event> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'zoho_crm'>, integration: Integration): ZohoCrmClient {
  return new ZohoCrmClient();
}

// TODO: support other geographies
export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://accounts.zoho.com',
  tokenPath: '/oauth/v2/token',
  authorizeHost: 'https://accounts.zoho.com',
  authorizePath: '/oauth/v2/auth',
};
