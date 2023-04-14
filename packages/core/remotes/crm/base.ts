import {
  ConnectionUnsafe,
  CRMProviderName,
  Integration,
  RemoteAccount,
  RemoteAccountCreateParams,
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
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface CrmRemoteClient extends RemoteClient {
  listAccounts(updatedAfter?: Date): Promise<Readable>; // streams RemoteAccount
  createAccount(params: RemoteAccountCreateParams): Promise<RemoteAccount>;
  updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount>;

  listContacts(updatedAfter?: Date): Promise<Readable>; // streams RemoteContact
  createContact(params: RemoteContactCreateParams): Promise<RemoteContact>;
  updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact>;

  listLeads(updatedAfter?: Date): Promise<Readable>; // streams RemoteLead
  createLead(params: RemoteLeadCreateParams): Promise<RemoteLead>;
  updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead>;

  listOpportunities(updatedAfter?: Date): Promise<Readable>; // streams RemoteOpportunity
  createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity>;
  updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity>;

  // Note: User creation/updates are not supported
  listUsers(updatedAfter?: Date): Promise<Readable>; // streams RemoteUser

  listEvents(updatedAfter?: Date): Promise<Readable>; // streams RemoteEvent
  createEvent(params: RemoteEventCreateParams): Promise<RemoteEvent>;
  updateEvent(params: RemoteEventUpdateParams): Promise<RemoteEvent>;
}

export abstract class AbstractCrmRemoteClient extends AbstractRemoteClient implements CrmRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  abstract listAccounts(updatedAfter?: Date): Promise<Readable>; // streams RemoteAccount
  abstract createAccount(params: RemoteAccountCreateParams): Promise<RemoteAccount>;
  abstract updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount>;

  abstract listContacts(updatedAfter?: Date): Promise<Readable>; // streams RemoteContact
  abstract createContact(params: RemoteContactCreateParams): Promise<RemoteContact>;
  abstract updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact>;

  abstract listLeads(updatedAfter?: Date): Promise<Readable>; // streams RemoteLead
  abstract createLead(params: RemoteLeadCreateParams): Promise<RemoteLead>;
  abstract updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead>;

  abstract listOpportunities(updatedAfter?: Date): Promise<Readable>; // streams RemoteOpportunity
  abstract createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity>;
  abstract updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity>;

  // Note: User creation/updates are not supported
  abstract listUsers(updatedAfter?: Date): Promise<Readable>; // streams RemoteUser

  abstract listEvents(updatedAfter?: Date): Promise<Readable>; // streams RemoteEvent
  abstract createEvent(params: RemoteEventCreateParams): Promise<RemoteEvent>;
  abstract updateEvent(params: RemoteEventUpdateParams): Promise<RemoteEvent>;
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
