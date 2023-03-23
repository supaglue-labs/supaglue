import { Client } from '@hubspot/api-client';
import { CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedCompanies } from '@hubspot/api-client/lib/codegen/crm/companies';
import { CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedContacts } from '@hubspot/api-client/lib/codegen/crm/contacts';
import { CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedDeals } from '@hubspot/api-client/lib/codegen/crm/deals';
import { CollectionResponsePublicOwnerForwardPaging as HubspotPaginatedOwners } from '@hubspot/api-client/lib/codegen/crm/owners';
import retry from 'async-retry';
import { PassThrough, Readable } from 'stream';
import { logger } from '../../../lib';
import { CRMConnectionUnsafe } from '../../../types/connection';
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
} from '../../../types/crm';
import { CompleteIntegration } from '../../../types/integration';
import { SendPassthroughRequestRequest, SendPassthroughRequestResponse } from '../../../types/passthrough';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';
import {
  fromHubSpotCompanyToRemoteAccount,
  fromHubSpotContactToRemoteContact,
  fromHubSpotDealToRemoteOpportunity,
  fromHubspotOwnerToRemoteUser,
  toHubspotAccountCreateParams,
  toHubspotAccountUpdateParams,
  toHubspotContactCreateParams,
  toHubspotContactUpdateParams,
  toHubspotOpportunityCreateParams,
  toHubspotOpportunityUpdateParams,
} from './mappers';

const HUBSPOT_RECORD_LIMIT = 100;

const ASYNC_RETRY_OPTIONS = {
  // TODO: Don't make this 'forever', so that the activity will actually get heartbeats
  // and will know that this activity is making progress.
  forever: true,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 60 * 1000,
};

const propertiesToFetch = {
  company: [
    'name',
    'hubspot_owner_id',
    'description',
    'industry',
    'website',
    'numberofemployees',
    'address',
    'address2',
    'city',
    'state',
    'country',
    'zip',
    'phone',
    'notes_last_updated',
    'createddate',
    'hs_lastmodifieddate',
  ],
  contact: [
    'address', // TODO: IP state/zip/country?
    'address2',
    'city',
    'country',
    'createdate',
    'email',
    'fax',
    'firstname',
    'hs_createdate', // TODO: Use this or createdate?
    'hs_is_contact', // TODO: distinguish from "visitor"?
    'hs_lastmodifieddate', // TODO: Use this or lastmodifieddate?
    'hubspot_owner_id',
    'lastmodifieddate',
    'lastname',
    'mobilephone',
    'phone',
    'state',
    'work_email',
    'zip',
  ],
  deal: [
    'dealname',
    'description',
    'dealstage',
    'amount',
    'hubspot_owner_id',
    'notes_last_updated',
    'closedate',
    'hs_is_closed_won',
    'hs_is_closed',
  ],
};

// TODO: We may need to fetch this from the hubspot schema
const CONTACT_TO_PRIMARY_COMPANY_ASSOCIATION_ID = 1;
const OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID = 5;

type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
};

class HubSpotClient extends AbstractCrmRemoteClient {
  readonly #client: Client;
  readonly #credentials: Credentials;

  public constructor(credentials: Credentials) {
    super('https://api.hubapi.com');
    const { accessToken } = credentials;
    this.#client = new Client({
      accessToken,
    });
    this.#credentials = credentials;
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#credentials.accessToken}`,
    };
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (!this.#credentials.expiresAt || Date.parse(this.#credentials.expiresAt) < Date.now() + 300000) {
      const token = await this.#client.oauth.tokensApi.createToken(
        'refresh_token',
        undefined,
        undefined,
        this.#credentials.clientId,
        this.#credentials.clientSecret,
        this.#credentials.refreshToken
      );

      const newAccessToken = token.accessToken;
      const newExpiresAt = new Date(Date.now() + token.expiresIn * 1000).toISOString();

      this.#credentials.accessToken = newAccessToken;
      this.#credentials.expiresAt = newExpiresAt;

      this.#client.setAccessToken(newAccessToken);
      this.emit('token_refreshed', newAccessToken, newExpiresAt);
    }
  }

  public async listAccounts(): Promise<Readable> {
    const passThrough = new PassThrough({ objectMode: true });

    (async () => {
      let after = undefined;
      do {
        const currResults: HubspotPaginatedCompanies = await this.listAccountsImpl(after);
        const remoteAccounts = currResults.results.map(fromHubSpotCompanyToRemoteAccount);
        after = currResults.paging?.next?.after;

        // Do not emit 'end' event until the last batch
        const readable = Readable.from(remoteAccounts);
        readable.pipe(passThrough, { end: !after });
        readable.on('error', (err) => passThrough.emit('error', err));

        // Wait
        await new Promise((resolve) => readable.on('end', resolve));
      } while (after);
    })().catch((err: unknown) => {
      // We need to forward the error to the returned `Readable` because there
      // is no way for the caller to find out about errors in the above async block otherwise.
      passThrough.emit('error', err);
    });

    return passThrough;
  }

  private async listAccountsImpl(after?: string): Promise<HubspotPaginatedCompanies> {
    const helper = async () => {
      try {
        await this.maybeRefreshAccessToken();
        const companies = await this.#client.crm.companies.basicApi.getPage(
          HUBSPOT_RECORD_LIMIT,
          after,
          propertiesToFetch.company
        );
        return companies;
      } catch (e: any) {
        logger.error(e, 'Error encountered');
        throw e;
      }
    };
    return await retry(helper, ASYNC_RETRY_OPTIONS);
  }

  private async getAccount(remoteId: string): Promise<RemoteAccount> {
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.getById(remoteId, propertiesToFetch.company);
    return fromHubSpotCompanyToRemoteAccount(company);
  }

  public async createAccount(params: RemoteAccountCreateParams): Promise<RemoteAccount> {
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.create({
      properties: toHubspotAccountCreateParams(params),
    });
    return await this.getAccount(company.id);
  }

  public async updateAccount(params: RemoteAccountUpdateParams): Promise<RemoteAccount> {
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.update(params.remoteId, {
      properties: toHubspotAccountUpdateParams(params),
    });
    return await this.getAccount(company.id);
  }

  public async listOpportunities(): Promise<Readable> {
    const passThrough = new PassThrough({ objectMode: true });

    (async () => {
      let after = undefined;
      do {
        const currResults: HubspotPaginatedDeals = await this.listOpportunitiesImpl(after);
        const remoteOpportunities = currResults.results.map(fromHubSpotDealToRemoteOpportunity);
        after = currResults.paging?.next?.after;

        // Do not emit 'end' event until the last batch
        const readable = Readable.from(remoteOpportunities);
        readable.pipe(passThrough, { end: !after });
        readable.on('error', (err) => passThrough.emit('error', err));

        // Wait
        await new Promise((resolve) => readable.on('end', resolve));
      } while (after);
    })().catch((err: unknown) => {
      // We need to forward the error to the returned `Readable` because there
      // is no way for the caller to find out about errors in the above async block otherwise.
      passThrough.emit('error', err);
    });

    return passThrough;
  }

  private async listOpportunitiesImpl(after?: string): Promise<HubspotPaginatedDeals> {
    const helper = async () => {
      try {
        await this.maybeRefreshAccessToken();
        const deals = await this.#client.crm.deals.basicApi.getPage(
          HUBSPOT_RECORD_LIMIT,
          after,
          propertiesToFetch.deal,
          /* propertiesWithHistory */ undefined,
          /* associations */ ['company']
        );
        return deals;
      } catch (e: any) {
        logger.error(e, 'Error encountered');
        throw e;
      }
    };
    return await retry(helper, ASYNC_RETRY_OPTIONS);
  }

  private async getOpportunity(remoteId: string): Promise<RemoteOpportunity> {
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.getById(
      remoteId,
      propertiesToFetch.deal,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return fromHubSpotDealToRemoteOpportunity(deal);
  }

  public async createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity> {
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.create({
      properties: toHubspotOpportunityCreateParams(params),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.deals.associationsApi.create(parseInt(deal.id), 'company', parseInt(params.accountId), [
        { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID },
      ]);
    }
    return await this.getOpportunity(deal.id);
  }

  public async updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity> {
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.update(params.remoteId, {
      properties: toHubspotOpportunityUpdateParams(params),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.deals.associationsApi.create(parseInt(deal.id), 'company', parseInt(params.accountId), [
        { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID },
      ]);
    }
    return await this.getOpportunity(deal.id);
  }

  public async listContacts(): Promise<Readable> {
    const passThrough = new PassThrough({ objectMode: true });

    (async () => {
      let after = undefined;
      do {
        const currResults: HubspotPaginatedContacts = await this.listContactsImpl(after);
        const remoteContacts = currResults.results.map(fromHubSpotContactToRemoteContact);
        after = currResults.paging?.next?.after;

        // Do not emit 'end' event until the last batch
        const readable = Readable.from(remoteContacts);
        readable.pipe(passThrough, { end: !after });
        readable.on('error', (err) => passThrough.emit('error', err));

        // Wait
        await new Promise((resolve) => readable.on('end', resolve));
      } while (after);
    })().catch((err: unknown) => {
      // We need to forward the error to the returned `Readable` because there
      // is no way for the caller to find out about errors in the above async block otherwise.
      passThrough.emit('error', err);
    });

    return passThrough;
  }

  private async listContactsImpl(after?: string): Promise<HubspotPaginatedContacts> {
    const helper = async () => {
      try {
        await this.maybeRefreshAccessToken();
        const contacts = await this.#client.crm.contacts.basicApi.getPage(
          HUBSPOT_RECORD_LIMIT,
          after,
          propertiesToFetch.contact,
          /* propertiesWithHistory */ undefined,
          /* associations */ ['company']
        );
        return contacts;
      } catch (e: any) {
        logger.error(e, 'Error encountered');
        throw e;
      }
    };
    return await retry(helper, ASYNC_RETRY_OPTIONS);
  }

  private async getContact(remoteId: string): Promise<RemoteContact> {
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.getById(
      remoteId,
      propertiesToFetch.contact,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return fromHubSpotContactToRemoteContact(contact);
  }

  public async createContact(params: RemoteContactCreateParams): Promise<RemoteContact> {
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.create({
      properties: toHubspotContactCreateParams(params),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.contacts.associationsApi.create(
        parseInt(contact.id),
        'company',
        parseInt(params.accountId),
        [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: CONTACT_TO_PRIMARY_COMPANY_ASSOCIATION_ID }]
      );
    }
    return await this.getContact(contact.id);
  }

  public async updateContact(params: RemoteContactUpdateParams): Promise<RemoteContact> {
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.update(params.remoteId, {
      properties: toHubspotContactUpdateParams(params),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.contacts.associationsApi.create(
        parseInt(contact.id),
        'company',
        parseInt(params.accountId),
        [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: CONTACT_TO_PRIMARY_COMPANY_ASSOCIATION_ID }]
      );
    }
    return await this.getContact(contact.id);
  }

  public async listLeads(limit?: number): Promise<Readable> {
    return Readable.from([]);
  }

  public async createLead(params: RemoteLeadCreateParams): Promise<RemoteLead> {
    throw new Error('Not supported');
  }

  public async updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead> {
    throw new Error('Not supported');
  }

  public async listUsers(): Promise<Readable> {
    const passThrough = new PassThrough({ objectMode: true });

    (async () => {
      let after = undefined;
      do {
        const currResults: HubspotPaginatedOwners = await this.listUsersImpl(after);
        const remoteAccounts = currResults.results.map(fromHubspotOwnerToRemoteUser);
        after = currResults.paging?.next?.after;

        // Do not emit 'end' event until the last batch
        const readable = Readable.from(remoteAccounts);
        readable.pipe(passThrough, { end: !after });
        readable.on('error', (err) => passThrough.emit('error', err));

        // Wait
        await new Promise((resolve) => readable.on('end', resolve));
      } while (after);
    })().catch((err: unknown) => {
      // We need to forward the error to the returned `Readable` because there
      // is no way for the caller to find out about errors in the above async block otherwise.
      passThrough.emit('error', err);
    });

    return passThrough;
  }

  private async listUsersImpl(after?: string): Promise<HubspotPaginatedOwners> {
    const helper = async () => {
      try {
        await this.maybeRefreshAccessToken();
        const owners = await this.#client.crm.owners.ownersApi.getPage(
          /* email */ undefined,
          after,
          HUBSPOT_RECORD_LIMIT
        );
        return owners;
      } catch (e: any) {
        logger.error(e, 'Error encountered');
        throw e;
      }
    };
    return await retry(helper, ASYNC_RETRY_OPTIONS);
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }
}

// TODO: We should pass in a type-narrowed CRMConnection
export function newClient(connection: CRMConnectionUnsafe, integration: CompleteIntegration): HubSpotClient {
  return new HubSpotClient({
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    expiresAt: connection.credentials.expiresAt,
    clientId: integration.config.oauth.credentials.oauthClientId,
    clientSecret: integration.config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.hubapi.com',
  tokenPath: '/oauth/v1/token',
  authorizeHost: 'https://app.hubspot.com',
  authorizePath: '/oauth/authorize',
};
