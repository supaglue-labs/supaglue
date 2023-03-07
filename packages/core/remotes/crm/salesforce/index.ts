// fetch methods / types not present in @types/node yet
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import { CsvError, Info, parse } from 'csv-parse';
import * as jsforce from 'jsforce';
import { AccountCreateParams, RemoteAccount, RemoteAccountUpdateParams } from '../../../types/account';
import { CRMConnection } from '../../../types/connection';
import { RemoteContact, RemoteContactCreateParams, RemoteContactUpdateParams } from '../../../types/contact';
import { Integration } from '../../../types/integration';
import { RemoteLead, RemoteLeadCreateParams, RemoteLeadUpdateParams } from '../../../types/lead';
import {
  RemoteOpportunity,
  RemoteOpportunityCreateParams,
  RemoteOpportunityUpdateParams,
} from '../../../types/opportunity';
import { ConnectorAuthConfig, CrmRemoteClient, CrmRemoteClientEventEmitter } from '../base';
import {
  fromSalesforceAccountToRemoteAccount,
  fromSalesforceContactToRemoteContact,
  fromSalesforceLeadToRemoteLead,
  fromSalesforceOpportunityToRemoteOpportunity,
  toSalesforceAccountCreateParams,
  toSalesforceAccountUpdateParams,
  toSalesforceContactCreateParams,
  toSalesforceContactUpdateParams,
  toSalesforceLeadCreateParams,
  toSalesforceLeadUpdateParams,
  toSalesforceOpportunityCreateParams,
  toSalesforceOpportunityUpdateParams,
} from './mappers';

const propertiesToFetch = {
  account: [
    'Id',
    'OwnerId',
    'Name',
    'Description',
    'Industry',
    'Website',
    'NumberOfEmployees',
    // We may not need all of these fields in order to map to common model
    'BillingCity',
    'BillingCountry',
    'BillingPostalCode',
    'BillingState',
    'BillingStreet',
    // We may not need all of these fields in order to map to common model
    'ShippingCity',
    'ShippingCountry',
    'ShippingPostalCode',
    'ShippingState',
    'ShippingStreet',
    'Phone',
    'Fax',
    'LastActivityDate',
    'CreatedDate',
    'LastModifiedDate',
    'IsDeleted',
  ],
  contact: [
    'Id',
    'AccountId',
    'FirstName',
    'LastName',
    'Email',
    'Phone',
    'Fax',
    'HomePhone',
    'MobilePhone',
    'OtherPhone',
    'AssistantPhone',
    'CreatedDate',
    'LastActivityDate',
    // We may not need all of these fields in order to map to common model
    'MailingCity',
    'MailingCountry',
    'MailingPostalCode',
    'MailingState',
    'MailingStreet',
    // We may not need all of these fields in order to map to common model
    'OtherCity',
    'OtherCountry',
    'OtherPostalCode',
    'OtherState',
    'OtherStreet',
    'IsDeleted',
  ],
  opportunity: [
    'Id',
    'OwnerId',
    'Name',
    'Description',
    'LastActivityDate',
    'Amount',
    'IsClosed',
    'IsDeleted',
    'IsWon',
    'StageName',
    'CloseDate',
    'CreatedDate',
    'LastModifiedDate',
    'AccountId',
  ],
  lead: [
    'Id',
    'OwnerId',
    'Title',
    'FirstName',
    'LastName',
    'ConvertedDate',
    'CreatedDate',
    'LastModifiedDate',
    'ConvertedContactId',
    'ConvertedAccountId',
    'Company',
    'City',
    'State',
    'Street',
    'Country',
    'PostalCode',
    'Phone',
    'Email',
    'IsDeleted',
  ],
};

// this is incomplete; it only includes the fields that we need to use
type SalesforceBulk2QueryJob = {
  id: string;
  state: 'Open' | 'UploadComplete' | 'InProgress' | 'Aborted' | 'JobComplete' | 'Failed';
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBulk2QueryJobNextLocatorFromResponse(response: Response): string | undefined {
  const locator = response.headers.get('Sforce-locator');
  return locator && locator !== 'null' ? locator : undefined;
}

async function getBulk2QueryJobResultsFromResponse(response: Response): Promise<Record<string, string>[]> {
  // TODO: Stream this instead of reading all into memory at once?
  const text = await response.text();
  return new Promise((resolve, reject) => {
    parse(text, { columns: true }, (err: CsvError | undefined, records: Record<string, string>[], info: Info) => {
      if (err) {
        return reject(err);
      }
      resolve(records);
    });
  });
}

class SalesforceClient extends CrmRemoteClientEventEmitter implements CrmRemoteClient {
  readonly #client: jsforce.Connection;

  readonly #instanceUrl: string;
  readonly #refreshToken: string;
  #accessToken: string;

  public constructor({
    instanceUrl,
    refreshToken,
    accessToken,
    clientId,
    clientSecret,
  }: {
    instanceUrl: string;
    refreshToken: string;
    accessToken: string;
    clientId: string;
    clientSecret: string;
  }) {
    super();

    this.#instanceUrl = instanceUrl;
    this.#refreshToken = refreshToken;
    this.#accessToken = accessToken;

    this.#client = new jsforce.Connection({
      oauth2: new jsforce.OAuth2({
        loginUrl: 'https://login.salesforce.com',
        clientId,
        clientSecret,
      }),
      instanceUrl,
      refreshToken,
      maxRequest: 10,
    });
  }

  async #refreshAccessToken(): Promise<void> {
    // TODO: Shouldn't be relying on `jsforce` to do this.
    const token = await this.#client.oauth2.refreshToken(this.#refreshToken);
    this.#accessToken = token.access_token;
    const hadListeners = this.emit('token_refreshed', token.access_token, null);
  }

  async #fetch(path: string, init: RequestInit): Promise<ReturnType<typeof fetch>> {
    const helper = async () => {
      return await fetch(`${this.#instanceUrl}${path}`, {
        ...init,
        headers: {
          ...init.headers,
          Authorization: `Bearer ${this.#accessToken}`,
        },
      });
    };

    const response = await helper();

    // Only try to refresh token once (to avoid infinite loop).
    // TODO: Clean up this code a bit.
    // TODO: We should consider having a global singleton to do a single token refresh rather
    //       than many concurrent ones.
    // TODO: Check on `jsforce` periodically to see if we can just use that library instead
    // of writing this ourselves. For now, we are writing ourselves due to issue with hanging
    // CSV download for bulk 2.0 with large loads and also more future control of rate limits,
    // etc.
    if (response.status === 401) {
      await this.#refreshAccessToken();
      const response = await helper();
      if (response.status !== 200) {
        throw new Error(`Status code ${response.status} when calling salesforce API`);
      }
      return response;
    }

    if (response.status !== 200) {
      throw new Error(`Status code ${response.status} when calling salesforce API`);
    }

    return response;
  }

  async #submitBulk2QueryJob(soql: string): Promise<SalesforceBulk2QueryJob> {
    const response = await this.#fetch('/services/data/v57.0/jobs/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'query',
        query: soql,
      }),
    });
    return await response.json();
  }

  async #pollBulk2QueryJob(jobId: string): Promise<void> {
    const poll = async (): Promise<SalesforceBulk2QueryJob> => {
      const response = await this.#fetch(`/services/data/v57.0/jobs/query/${jobId}`, {
        method: 'GET',
      });
      return await response.json();
    };

    const startTime = Date.now();
    const timeout = 5 * 60 * 1000; // TODO: make configurable
    const interval = 1000; // TODO: make configurable

    while (startTime + timeout > Date.now()) {
      const { state } = await poll();
      switch (state) {
        case 'Open':
          throw new Error('job has not been started');
        case 'Aborted':
          throw new Error('job has been aborted');
        case 'UploadComplete':
        case 'InProgress':
          await delay(interval);
          break;
        case 'Failed':
          throw new Error('job has failed');
        case 'JobComplete':
          return;
      }
    }

    throw new Error('bulk 2.0 job polling timed out');
  }

  async #getBulk2QueryJobResponse(jobId: string, locator?: string): Promise<Response> {
    const params = new URLSearchParams();
    if (locator) {
      params.set('locator', locator);
    }

    return await this.#fetch(`/services/data/v57.0/jobs/query/${jobId}/results?${params}`, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept: 'text/csv',
      },
    });
  }

  async #getBulk2QueryJobResults(soql: string): Promise<Record<string, string>[]> {
    const { id } = await this.#submitBulk2QueryJob(soql);

    await this.#pollBulk2QueryJob(id);

    const recordsPromises: Promise<Record<string, string>[]>[] = [];
    let locator: string | undefined = undefined;
    do {
      const response = await this.#getBulk2QueryJobResponse(id, locator);
      const recordsPromise = getBulk2QueryJobResultsFromResponse(response);
      recordsPromises.push(recordsPromise);
      locator = getBulk2QueryJobNextLocatorFromResponse(response);
    } while (locator);

    const unflattenedRecords = await Promise.all(recordsPromises);
    return unflattenedRecords.flat();
  }

  public async listAccounts(): Promise<RemoteAccount[]> {
    const soql = `
      SELECT ${propertiesToFetch.account.join(', ')}
      FROM Account
    `;

    const accounts = await this.#getBulk2QueryJobResults(soql);
    return accounts.map(fromSalesforceAccountToRemoteAccount);
  }

  public async getAccount(remoteId: string): Promise<RemoteAccount> {
    const account = await this.#client.retrieve('Account', remoteId);
    return fromSalesforceAccountToRemoteAccount(account);
  }

  public async createAccount(params: AccountCreateParams): Promise<RemoteAccount> {
    const response = await this.#client.create('Account', toSalesforceAccountCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce account');
    }

    return await this.getAccount(response.id);
  }

  public async updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount> {
    const response = await this.#client.update('Account', toSalesforceAccountUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce account');
    }
    return await this.getAccount(response.id);
  }

  public async listContacts(): Promise<RemoteContact[]> {
    const soql = `
      SELECT ${propertiesToFetch.contact.join(', ')}
      FROM Contact
    `;
    const contacts = await this.#getBulk2QueryJobResults(soql);
    return contacts.map(fromSalesforceContactToRemoteContact);
  }

  public async getContact(remoteId: string): Promise<RemoteContact> {
    const contact = await this.#client.retrieve('Contact', remoteId);
    return fromSalesforceContactToRemoteContact(contact);
  }

  public async createContact(params: RemoteContactCreateParams): Promise<RemoteContact> {
    const response = await this.#client.create('Contact', toSalesforceContactCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce contact');
    }
    return await this.getContact(response.id);
  }

  public async updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact> {
    const response = await this.#client.update('Contact', toSalesforceContactUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce contact');
    }
    return await this.getContact(response.id);
  }

  public async listOpportunities(): Promise<RemoteOpportunity[]> {
    const soql = `
      SELECT ${propertiesToFetch.opportunity.join(', ')}
      FROM Opportunity
    `;

    const opportunities = await this.#getBulk2QueryJobResults(soql);
    return opportunities.map(fromSalesforceOpportunityToRemoteOpportunity);
  }

  public async getOpportunity(remoteId: string): Promise<RemoteOpportunity> {
    const contact = await this.#client.retrieve('Opportunity', remoteId);
    return fromSalesforceOpportunityToRemoteOpportunity(contact);
  }

  public async createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity> {
    const response = await this.#client.create('Opportunity', toSalesforceOpportunityCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce opportunity');
    }
    return await this.getOpportunity(response.id);
  }

  public async updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity> {
    const response = await this.#client.update('Opportunity', toSalesforceOpportunityUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce opportunity');
    }
    return await this.getOpportunity(response.id);
  }

  public async listLeads(): Promise<RemoteLead[]> {
    const soql = `
      SELECT ${propertiesToFetch.lead.join(', ')}
      FROM Lead 
    `;

    const leads = await this.#getBulk2QueryJobResults(soql);
    return leads.map(fromSalesforceLeadToRemoteLead);
  }

  public async getLead(remoteId: string): Promise<RemoteLead> {
    const contact = await this.#client.retrieve('Lead', remoteId);
    return fromSalesforceLeadToRemoteLead(contact);
  }

  public async createLead(params: RemoteLeadCreateParams): Promise<RemoteLead> {
    const response = await this.#client.create('Lead', toSalesforceLeadCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce lead');
    }
    return await this.getLead(response.id);
  }

  public async updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead> {
    const response = await this.#client.update('Lead', toSalesforceLeadUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce lead');
    }
    return await this.getLead(response.id);
  }
}

// TODO: We should pass in a type-narrowed CRMConnection
export function newClient(connection: CRMConnection, integration: Integration): SalesforceClient {
  return new SalesforceClient({
    instanceUrl: connection.credentials.instanceUrl,
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    clientId: integration.config.oauth.credentials.oauthClientId,
    clientSecret: integration.config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://login.salesforce.com',
  tokenPath: '/services/oauth2/token',
  authorizeHost: 'https://login.salesforce.com',
  authorizePath: '/services/oauth2/authorize',
};
