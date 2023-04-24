// fetch methods / types not present in @types/node yet
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import {
  AccountCreateParams,
  ConnectionUnsafe,
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
import retry from 'async-retry';
import { parse } from 'csv-parse';
import * as jsforce from 'jsforce';
import { PassThrough, pipeline, Readable, Transform } from 'stream';
import { ASYNC_RETRY_OPTIONS, logger } from '../../../lib';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';
import {
  fromSalesforceAccountToRemoteAccount,
  fromSalesforceContactToRemoteContact,
  fromSalesforceLeadToRemoteLead,
  fromSalesforceOpportunityToRemoteOpportunity,
  fromSalesforceUserToRemoteUser,
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
    'SystemModstamp',
    'IsDeleted',
  ],
  contact: [
    'Id',
    'OwnerId',
    'AccountId',
    'FirstName',
    'LastName',
    'Email',
    'Phone',
    'Fax',
    'HomePhone',
    'MobilePhone',
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
    'CreatedDate',
    'SystemModstamp',
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
    'SystemModstamp',
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
    'SystemModstamp',
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
  user: ['Id', 'Name', 'Email', 'IsActive', 'CreatedDate', 'SystemModstamp'],
  event: [
    'Id',
    'StartDateTime',
    'EndDateTime',
    'OwnerId',
    'Subject',
    'CreatedDate',
    'SystemModstamp',
    'WhoId',
    'AccountId',
    'WhatId',
  ],
};

const FETCH_TIMEOUT = 60 * 1000;

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

function getBulk2QueryJobResultsFromResponse(response: Response): Readable {
  if (!response.body) {
    throw new Error('No response body found for salesforce bulk 2.0 query');
  }

  const parser = parse({
    columns: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
  return pipeline(Readable.fromWeb(response.body as any), parser, () => {});
}

class SalesforceClient extends AbstractCrmRemoteClient {
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
    loginUrl,
  }: {
    instanceUrl: string;
    refreshToken: string;
    accessToken: string;
    clientId: string;
    clientSecret: string;
    loginUrl?: string;
  }) {
    super(instanceUrl);

    this.#instanceUrl = instanceUrl;
    this.#refreshToken = refreshToken;
    this.#accessToken = accessToken;

    this.#client = new jsforce.Connection({
      oauth2: new jsforce.OAuth2({
        loginUrl: loginUrl ?? 'https://login.salesforce.com',
        clientId,
        clientSecret,
      }),
      instanceUrl,
      refreshToken,
      maxRequest: 10,
    });
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#accessToken}`,
    };
  }

  async #refreshAccessToken(): Promise<void> {
    // TODO: Shouldn't be relying on `jsforce` to do this.
    const token = await this.#client.oauth2.refreshToken(this.#refreshToken);
    this.#accessToken = token.access_token;
    this.emit('token_refreshed', token.access_token, null);
  }

  async #fetchImpl(path: string, init: RequestInit, timeout = FETCH_TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(`${this.#instanceUrl}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        ...this.getAuthHeadersForPassthroughRequest(),
      },
      signal: controller.signal,
    });
    clearTimeout(id);

    return response;
  }

  async #fetch(path: string, init: RequestInit): Promise<ReturnType<typeof fetch>> {
    const helper = async (bail: (e: Error) => void) => {
      let response = await this.#fetchImpl(path, init);

      // Only try to refresh token once (to avoid infinite loop).
      // TODO: Clean up this code a bit.
      // TODO: We should consider having a global singleton to do a single token refresh rather
      //       than many concurrent ones.
      // TODO: Check on `jsforce` periodically to see if we can just use that library instead
      // of writing this ourselves. For now, we are writing ourselves due to issue with hanging
      // CSV download for bulk 2.0 with large loads and also more future control of rate limits,
      // etc.
      if (response.status === 401) {
        try {
          await this.#refreshAccessToken();
        } catch (e: any) {
          logger.error(e);
          // The error name in jsforce is generated at https://github.com/jsforce/jsforce/blob/master/lib/oauth2.js#L197
          // TODO(624): Move off of jsforce
          if (e.name === 'ERROR_HTTP_429') {
            throw e;
          }
          bail(e);
          return null as unknown as ReturnType<typeof fetch>;
        }
        response = await this.#fetchImpl(path, init);
      }

      if (response.status === 200) {
        return response;
      }
      const responseText = await response.text();
      const error = new Error(
        `Status code ${response.status} and status ${response.statusText} when calling salesforce API. Error: ${responseText}. Body: ${response.body}`
      ); // TODO: move the dynamic out of the message
      logger.error(error);
      if (response.status !== 429) {
        bail(error);
        return null as unknown as ReturnType<typeof fetch>;
      }
      throw error;
    };
    return await retry(helper, ASYNC_RETRY_OPTIONS);
  }

  async #submitBulk2QueryJob(soql: string): Promise<SalesforceBulk2QueryJob> {
    const response = await this.#fetch('/services/data/v57.0/jobs/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'queryAll',
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
    const interval = 10000; // TODO: make configurable

    while (startTime + timeout > Date.now()) {
      const pollResponse = await poll();
      const { state } = pollResponse;
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

  async #getBulk2QueryJobResults(soql: string): Promise<Readable> {
    const response = await this.#submitBulk2QueryJob(soql);
    const { id } = response;

    await this.#pollBulk2QueryJob(id);

    const passThrough = new PassThrough({ objectMode: true });

    // TODO: Simplify / clean up this code. Maybe we should start considering
    // deploying data syncs in separate Docker containers to isolate work.
    // It may also be easier to reason about stdout.
    // Return `passThrough` before we fetch all the data chunks
    (async () => {
      let locator: string | undefined = undefined;
      do {
        const response = await this.#getBulk2QueryJobResponse(id, locator);
        const readable = getBulk2QueryJobResultsFromResponse(response);
        locator = getBulk2QueryJobNextLocatorFromResponse(response);

        // Do not emit 'end' event until the last batch
        readable.pipe(passThrough, { end: !locator });
        readable.on('error', (err) => passThrough.emit('error', err));

        // Wait until we finish downloading the stream before moving onto the next chunk
        await new Promise((resolve) => readable.on('end', resolve));
      } while (locator);
    })().catch((err: unknown) => {
      // We need to forward the error to the returned `Readable` because there
      // is no way for the caller to find out about errors in the above async block otherwise.
      passThrough.emit('error', err);
    });

    return passThrough;
  }

  private async listCommonModelRecords(soql: string, mapper: (record: Record<string, any>) => any): Promise<Readable> {
    return pipeline(
      await this.#getBulk2QueryJobResults(soql),
      new Transform({
        objectMode: true,
        transform: (chunk, encoding, callback) => {
          try {
            callback(null, mapper(chunk));
          } catch (e: any) {
            return callback(e);
          }
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  }

  public async listAccounts(updatedAfter?: Date): Promise<Readable> {
    const baseSoql = `
      SELECT ${propertiesToFetch.account.join(', ')}
      FROM Account
    `;
    const soql = updatedAfter
      ? `${baseSoql} WHERE SystemModstamp > ${updatedAfter.toISOString()} ORDER BY SystemModstamp ASC`
      : baseSoql;
    return this.listCommonModelRecords(soql, fromSalesforceAccountToRemoteAccount);
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

  public async listContacts(updatedAfter?: Date): Promise<Readable> {
    const baseSoql = `
      SELECT ${propertiesToFetch.contact.join(', ')}
      FROM Contact
    `;
    const soql = updatedAfter
      ? `${baseSoql} WHERE SystemModstamp > ${updatedAfter.toISOString()} ORDER BY SystemModstamp ASC`
      : baseSoql;
    return this.listCommonModelRecords(soql, fromSalesforceContactToRemoteContact);
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

  public async listOpportunities(updatedAfter?: Date): Promise<Readable> {
    const baseSoql = `
      SELECT ${propertiesToFetch.opportunity.join(', ')}
      FROM Opportunity
    `;
    const soql = updatedAfter
      ? `${baseSoql} WHERE SystemModstamp > ${updatedAfter.toISOString()} ORDER BY SystemModstamp ASC`
      : baseSoql;
    return this.listCommonModelRecords(soql, fromSalesforceOpportunityToRemoteOpportunity);
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

  public async listLeads(updatedAfter?: Date): Promise<Readable> {
    const baseSoql = `
      SELECT ${propertiesToFetch.lead.join(', ')}
      FROM Lead 
    `;
    const soql = updatedAfter
      ? `${baseSoql} WHERE SystemModstamp > ${updatedAfter.toISOString()} ORDER BY SystemModstamp ASC`
      : baseSoql;
    return this.listCommonModelRecords(soql, fromSalesforceLeadToRemoteLead);
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

  public async listUsers(updatedAfter?: Date): Promise<Readable> {
    const baseSoql = `
      SELECT ${propertiesToFetch.user.join(', ')}
      FROM User
    `;
    const soql = updatedAfter
      ? `${baseSoql} WHERE SystemModstamp > ${updatedAfter.toISOString()} ORDER BY SystemModstamp ASC`
      : baseSoql;
    return this.listCommonModelRecords(soql, fromSalesforceUserToRemoteUser);
  }

  public async listEvents(updatedAfter?: Date): Promise<Readable> {
    return Readable.from([]);
    // const baseSoql = `
    //   SELECT ${propertiesToFetch.event.join(', ')}
    //   FROM Event
    // `;
    // const soql = updatedAfter
    //   ? `${baseSoql} WHERE SystemModstamp > ${updatedAfter.toISOString()} ORDER BY SystemModstamp ASC`
    //   : baseSoql;
    // return this.listCommonModelRecords(soql, fromSalesforceEventToRemoteEvent);
  }

  public async getEvent(remoteId: string): Promise<RemoteEvent> {
    throw new Error('Not implemented');
    // const event = await this.#client.retrieve('Event', remoteId);
    // return fromSalesforceEventToRemoteEvent(event);
  }

  public async createEvent(params: RemoteEventCreateParams): Promise<RemoteEvent> {
    throw new Error('Not implemented');
    // const response = await this.#client.create('Event', toSalesforceEventCreateParams(params));
    // if (!response.success) {
    //   throw new Error('Failed to create Salesforce event');
    // }
    // return await this.getEvent(response.id);
  }

  public async updateEvent(params: RemoteEventUpdateParams): Promise<RemoteEvent> {
    throw new Error('Not implemented');
    // const response = await this.#client.update('Event', toSalesforceEventUpdateParams(params));
    // if (!response.success) {
    //   throw new Error('Failed to update Salesforce event');
    // }
    // return await this.getEvent(response.id);
  }
}

export function newClient(connection: ConnectionUnsafe<'salesforce'>, integration: Integration): SalesforceClient {
  return new SalesforceClient({
    instanceUrl: connection.credentials.instanceUrl,
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    clientId: integration.config.oauth.credentials.oauthClientId,
    clientSecret: integration.config.oauth.credentials.oauthClientSecret,
    loginUrl: connection.credentials.loginUrl,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://login.salesforce.com',
  tokenPath: '/services/oauth2/token',
  authorizeHost: 'https://login.salesforce.com',
  authorizePath: '/services/oauth2/authorize',
};
