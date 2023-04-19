import {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  ConnectionUnsafe,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  CRMProviderName,
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
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface CrmRemoteClient extends RemoteClient {
  listAccounts(updatedAfter?: Date): Promise<Readable>; // streams Account
  createAccount(params: AccountCreateParams): Promise<Account>;
  updateAccount(params: AccountUpdateParams): Promise<Account>;

  listContacts(updatedAfter?: Date): Promise<Readable>; // streams Contact
  createContact(params: ContactCreateParams): Promise<Contact>;
  updateContact(params: ContactUpdateParams): Promise<Contact>;

  listLeads(updatedAfter?: Date): Promise<Readable>; // streams Lead
  createLead(params: LeadCreateParams): Promise<Lead>;
  updateLead(params: LeadUpdateParams): Promise<Lead>;

  listOpportunities(updatedAfter?: Date): Promise<Readable>; // streams Opportunity
  createOpportunity(params: OpportunityCreateParams): Promise<Opportunity>;
  updateOpportunity(params: OpportunityUpdateParams): Promise<Opportunity>;

  // Note: User creation/updates are not supported
  listUsers(updatedAfter?: Date): Promise<Readable>; // streams User

  listEvents(updatedAfter?: Date): Promise<Readable>; // streams Event
  createEvent(params: EventCreateParams): Promise<Event>;
  updateEvent(params: EventUpdateParams): Promise<Event>;
}

export abstract class AbstractCrmRemoteClient extends AbstractRemoteClient implements CrmRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  abstract listAccounts(updatedAfter?: Date): Promise<Readable>; // streams Account
  abstract createAccount(params: AccountCreateParams): Promise<Account>;
  abstract updateAccount(params: AccountUpdateParams): Promise<Account>;

  abstract listContacts(updatedAfter?: Date): Promise<Readable>; // streams Contact
  abstract createContact(params: ContactCreateParams): Promise<Contact>;
  abstract updateContact(params: ContactUpdateParams): Promise<Contact>;

  abstract listLeads(updatedAfter?: Date): Promise<Readable>; // streams Lead
  abstract createLead(params: LeadCreateParams): Promise<Lead>;
  abstract updateLead(params: LeadUpdateParams): Promise<Lead>;

  abstract listOpportunities(updatedAfter?: Date): Promise<Readable>; // streams Opportunity
  abstract createOpportunity(params: OpportunityCreateParams): Promise<Opportunity>;
  abstract updateOpportunity(params: OpportunityUpdateParams): Promise<Opportunity>;

  // Note: User creation/updates are not supported
  abstract listUsers(updatedAfter?: Date): Promise<Readable>; // streams User

  abstract listEvents(updatedAfter?: Date): Promise<Readable>; // streams Event
  abstract createEvent(params: EventCreateParams): Promise<Event>;
  abstract updateEvent(params: EventUpdateParams): Promise<Event>;
}

export abstract class CrmRemoteClientEventEmitter extends EventEmitter {}

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
};

export type CrmConnectorConfig<T extends CRMProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, integration: Integration) => AbstractCrmRemoteClient;
};
