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
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface CrmRemoteClient extends RemoteClient {
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

export abstract class AbstractCrmRemoteClient extends AbstractRemoteClient implements CrmRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  abstract listAccounts(): Promise<Readable>; // streams RemoteAccount
  abstract createAccount(params: RemoteAccountCreateParams): Promise<RemoteAccount>;
  abstract updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount>;

  abstract listContacts(): Promise<Readable>; // streams RemoteContact
  abstract createContact(params: RemoteContactCreateParams): Promise<RemoteContact>;
  abstract updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact>;

  abstract listLeads(): Promise<Readable>; // streams RemoteLead
  abstract createLead(params: RemoteLeadCreateParams): Promise<RemoteLead>;
  abstract updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead>;

  abstract listOpportunities(): Promise<Readable>; // streams RemoteOpportunity
  abstract createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity>;
  abstract updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity>;

  // Note: User creation/updates are not supported
  abstract listUsers(): Promise<Readable>; // streams RemoteUser
}

export abstract class CrmRemoteClientEventEmitter extends EventEmitter {}

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
};

export type CrmConnectorConfig = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: CRMConnectionUnsafe, integration: CompleteIntegration) => AbstractCrmRemoteClient;
};
