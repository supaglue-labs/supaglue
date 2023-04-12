import { Client } from '@hubspot/api-client';
import {
  CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedCompanies,
  CollectionResponseWithTotalSimplePublicObjectForwardPaging as HubspotPaginatedCompaniesWithTotal,
} from '@hubspot/api-client/lib/codegen/crm/companies';
import {
  CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedContacts,
  CollectionResponseWithTotalSimplePublicObjectForwardPaging as HubspotPaginatedContactsWithTotal,
} from '@hubspot/api-client/lib/codegen/crm/contacts';
import {
  CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedDeals,
  CollectionResponseWithTotalSimplePublicObjectForwardPaging as HubspotPaginatedDealsWithTotal,
} from '@hubspot/api-client/lib/codegen/crm/deals';
import { CollectionResponsePublicOwnerForwardPaging as HubspotPaginatedOwners } from '@hubspot/api-client/lib/codegen/crm/owners';
import {
  CRMConnectionUnsafe,
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
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import retry from 'async-retry';
import { PassThrough, Readable } from 'stream';
import { ASYNC_RETRY_OPTIONS, logger } from '../../../lib';
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
const HUBSPOT_SEARCH_RESULTS_LIMIT = 10000;

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
    'lifecyclestage',
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
    'hubspot_owner_id',
    'lifecyclestage',
    'lastmodifieddate', // hs_lastmodifieddate is missing
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
    'pipeline',
    'hs_is_closed_won',
    'hs_is_closed',
    'hs_lastmodifieddate',
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

  public async listAccounts(updatedAfter?: Date): Promise<Readable> {
    // TODO(585): Incremental uses the Search endpoint which doesn't allow for more than 10000 results. We need to introduce another layer of pagination.
    let impl = updatedAfter
      ? this.#listAccountsIncrementalImpl.bind(this, updatedAfter, HUBSPOT_RECORD_LIMIT)
      : this.#listAccountsFullImpl.bind(this);

    if (updatedAfter) {
      const response = await this.#listAccountsIncrementalImpl(updatedAfter, 0);
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        impl = this.#listAccountsFullImpl.bind(this);
      }
    }

    const passThrough = new PassThrough({ objectMode: true });

    (async () => {
      // Accounts
      {
        let after = undefined;
        do {
          const currResults: HubspotPaginatedCompanies = await impl(after);
          const remoteAccounts = currResults.results.map(fromHubSpotCompanyToRemoteAccount);
          after = currResults.paging?.next?.after;

          // Do not emit 'end' event until the last batch
          const readable = Readable.from(remoteAccounts);
          readable.pipe(passThrough, { end: false });
          readable.on('error', (err) => passThrough.emit('error', err));

          // Wait
          await new Promise((resolve) => readable.on('end', resolve));
        } while (after);
      }
      // Archived Accounts
      // TODO: this doesn't respect the `updatedAfter` parameter because we can't use the search API for archived accounts
      {
        let after = undefined;
        do {
          const currResults: HubspotPaginatedCompanies = await this.#listAccountsFullImpl(after, /* archived */ true);
          const remoteAccounts = currResults.results.map(fromHubSpotCompanyToRemoteAccount);
          after = currResults.paging?.next?.after;

          // Do not emit 'end' event until the last batch
          const readable = Readable.from(
            remoteAccounts.filter((remoteAccount) => {
              if (!updatedAfter) {
                return true;
              }

              if (!remoteAccount.remoteUpdatedAt) {
                return true;
              }

              return updatedAfter < remoteAccount.remoteUpdatedAt;
            })
          );
          readable.pipe(passThrough, { end: !after });
          readable.on('error', (err) => passThrough.emit('error', err));

          // Wait
          await new Promise((resolve) => readable.on('end', resolve));
        } while (after);
      }
    })().catch((err: unknown) => {
      // We need to forward the error to the returned `Readable` because there
      // is no way for the caller to find out about errors in the above async block otherwise.
      passThrough.emit('error', err);
    });

    return passThrough;
  }

  async #listAccountsFullImpl(after?: string, archived?: boolean): Promise<HubspotPaginatedCompanies> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const companies = await this.#client.crm.companies.basicApi.getPage(
        HUBSPOT_RECORD_LIMIT,
        after,
        propertiesToFetch.company,
        undefined,
        undefined,
        archived
      );
      return companies;
    });
  }

  async #listAccountsIncrementalImpl(
    updatedAfter: Date,
    limit: number,
    after?: string
  ): Promise<HubspotPaginatedCompaniesWithTotal> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const companies = await this.#client.crm.companies.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'hs_lastmodifieddate',
                operator: 'GT', // TODO: should we do GTE in case there are multiple records updated at the same timestamp?
                value: updatedAfter.getTime().toString(),
              },
            ],
          },
        ],
        sorts: [
          {
            propertyName: 'hs_lastmodifieddate',
            direction: 'ASCENDING',
          } as unknown as string, // hubspot sdk has wrong types https://github.com/HubSpot/hubspot-api-nodejs/issues/350
        ],
        properties: propertiesToFetch.company,
        limit,
        after: after as unknown as number, // hubspot sdk has wrong types https://github.com/HubSpot/hubspot-api-nodejs/issues/350
      });
      return companies;
    });
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

  public async listOpportunities(updatedAfter?: Date): Promise<Readable> {
    // TODO(585): Incremental uses the Search endpoint which doesn't allow for more than 10000 results. We need to introduce another layer of pagination.
    let impl = updatedAfter
      ? this.#listOpportunitiesIncrementalImpl.bind(this, updatedAfter, HUBSPOT_RECORD_LIMIT)
      : this.#listOpportunitiesFullImpl.bind(this);

    if (updatedAfter) {
      const response = await this.#listOpportunitiesIncrementalImpl(updatedAfter, 0);
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        impl = this.#listOpportunitiesFullImpl.bind(this);
      }
    }

    const passThrough = new PassThrough({ objectMode: true });

    (async () => {
      // Opportunities
      {
        let after = undefined;
        do {
          const currResults: HubspotPaginatedDeals = await impl(after);
          const remoteOpportunities = currResults.results.map(fromHubSpotDealToRemoteOpportunity);
          after = currResults.paging?.next?.after;

          // Do not emit 'end' event until the last batch
          const readable = Readable.from(remoteOpportunities);
          readable.pipe(passThrough, { end: false });
          readable.on('error', (err) => passThrough.emit('error', err));

          // Wait
          await new Promise((resolve) => readable.on('end', resolve));
        } while (after);
      }
      // Archived Opportunities
      // TODO: this doesn't respect the `updatedAfter` parameter because we can't use the search API for archived opportunities
      {
        let after = undefined;
        do {
          const currResults: HubspotPaginatedDeals = await this.#listOpportunitiesFullImpl(after, /* archived */ true);
          const remoteOpportunities = currResults.results.map(fromHubSpotDealToRemoteOpportunity);
          after = currResults.paging?.next?.after;

          // Do not emit 'end' event until the last batch
          const readable = Readable.from(
            remoteOpportunities.filter((remoteOpportunity) => {
              if (!updatedAfter) {
                return true;
              }

              if (!remoteOpportunity.remoteUpdatedAt) {
                return true;
              }

              return updatedAfter < remoteOpportunity.remoteUpdatedAt;
            })
          );
          readable.pipe(passThrough, { end: !after });
          readable.on('error', (err) => passThrough.emit('error', err));

          // Wait
          await new Promise((resolve) => readable.on('end', resolve));
        } while (after);
      }
    })().catch((err: unknown) => {
      // We need to forward the error to the returned `Readable` because there
      // is no way for the caller to find out about errors in the above async block otherwise.
      passThrough.emit('error', err);
    });

    return passThrough;
  }

  async #listOpportunitiesFullImpl(after?: string, archived?: boolean): Promise<HubspotPaginatedDeals> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const deals = await this.#client.crm.deals.basicApi.getPage(
        HUBSPOT_RECORD_LIMIT,
        after,
        propertiesToFetch.deal,
        /* propertiesWithHistory */ undefined,
        /* associations */ ['company'],
        archived
      );
      return deals;
    });
  }

  async #listOpportunitiesIncrementalImpl(
    updatedAfter: Date,
    limit: number,
    after?: string
  ): Promise<HubspotPaginatedDealsWithTotal> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await this.#client.crm.deals.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'hs_lastmodifieddate',
                operator: 'GT', // TODO: should we do GTE in case there are multiple records updated at the same timestamp?
                value: updatedAfter.getTime().toString(),
              },
            ],
          },
        ],
        sorts: [
          {
            propertyName: 'hs_lastmodifieddate',
            direction: 'ASCENDING',
          } as unknown as string, // hubspot sdk has wrong types https://github.com/HubSpot/hubspot-api-nodejs/issues/350
        ],
        properties: propertiesToFetch.deal,
        limit,
        after: after as unknown as number, // hubspot sdk has wrong types https://github.com/HubSpot/hubspot-api-nodejs/issues/350
      });

      const dealIds = response.results.map((deal) => deal.id);

      // Get associations
      const dealToCompaniesMap = await this.#listAssociations(
        'deal',
        'company',
        dealIds.map((id) => id)
      );

      // Add associations to deals
      // TODO: We shouldn't hijack the response object like this; clean this code up
      return {
        ...response,
        results: response.results.map((deal) => ({
          ...deal,
          associations: {
            companies: {
              results: (dealToCompaniesMap[deal.id] ?? []).map((id) => ({ id, type: 'deal_to_company' })),
            },
          },
        })),
      };
    });
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

  public async listContacts(updatedAfter?: Date): Promise<Readable> {
    // TODO(585): Incremental uses the Search endpoint which doesn't allow for more than 10000 results. We need to introduce another layer of pagination.
    let impl = updatedAfter
      ? this.#listContactsIncrementalImpl.bind(this, updatedAfter, HUBSPOT_RECORD_LIMIT)
      : this.#listContactsFullImpl.bind(this);

    if (updatedAfter) {
      const response = await this.#listContactsIncrementalImpl(updatedAfter, 0);
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        impl = this.#listContactsFullImpl.bind(this);
      }
    }

    const passThrough = new PassThrough({ objectMode: true });

    (async () => {
      // Contacts
      {
        let after = undefined;
        do {
          const currResults: HubspotPaginatedContacts = await impl(after);
          const remoteContacts = currResults.results.map(fromHubSpotContactToRemoteContact);
          after = currResults.paging?.next?.after;

          // Do not emit 'end' event until the last batch
          const readable = Readable.from(remoteContacts);
          readable.pipe(passThrough, { end: false });
          readable.on('error', (err) => passThrough.emit('error', err));

          // Wait
          await new Promise((resolve) => readable.on('end', resolve));
        } while (after);
      }
      // Archived Contacts
      // TODO: this doesn't respect the `updatedAfter` parameter because we can't use the search API for archived contacts
      {
        let after = undefined;
        do {
          const currResults: HubspotPaginatedContacts = await this.#listContactsFullImpl(after, /* archived */ true);
          const remoteContacts = currResults.results.map(fromHubSpotContactToRemoteContact);
          after = currResults.paging?.next?.after;

          // Do not emit 'end' event until the last batch
          const readable = Readable.from(
            remoteContacts.filter((remoteContact) => {
              if (!updatedAfter) {
                return true;
              }

              if (!remoteContact.remoteUpdatedAt) {
                return true;
              }

              return updatedAfter < remoteContact.remoteUpdatedAt;
            })
          );
          readable.pipe(passThrough, { end: !after });
          readable.on('error', (err) => passThrough.emit('error', err));

          // Wait
          await new Promise((resolve) => readable.on('end', resolve));
        } while (after);
      }
    })().catch((err: unknown) => {
      // We need to forward the error to the returned `Readable` because there
      // is no way for the caller to find out about errors in the above async block otherwise.
      passThrough.emit('error', err);
    });

    return passThrough;
  }

  async #listContactsFullImpl(after?: string, archived?: boolean): Promise<HubspotPaginatedContacts> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const contacts = await this.#client.crm.contacts.basicApi.getPage(
        HUBSPOT_RECORD_LIMIT,
        after,
        propertiesToFetch.contact,
        /* propertiesWithHistory */ undefined,
        /* associations */ ['company'],
        archived
      );
      return contacts;
    });
  }

  async #listContactsIncrementalImpl(
    updatedAfter: Date,
    limit: number,
    after?: string
  ): Promise<HubspotPaginatedContactsWithTotal> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();

      // Get contacts
      const response = await this.#client.crm.contacts.searchApi.doSearch({
        filterGroups: [
          {
            filters: [
              {
                propertyName: 'lastmodifieddate', // hubspot doesn't set hs_lastmodifieddate for some reason
                operator: 'GT', // TODO: should we do GTE in case there are multiple records updated at the same timestamp?
                value: updatedAfter.getTime().toString(),
              },
            ],
          },
        ],
        sorts: [
          {
            propertyName: 'lastmodifieddate',
            direction: 'ASCENDING',
          } as unknown as string, // hubspot sdk has wrong types
        ],
        properties: propertiesToFetch.contact,
        limit,
        after: after as unknown as number, // hubspot sdk has wrong types
      });

      const contactIds = response.results.map((contact) => contact.id);

      // Get associations
      const contactToCompaniesMap = await this.#listAssociations(
        'contact',
        'company',
        contactIds.map((id) => id)
      );

      // Add associations to contacts
      // TODO: We shouldn't hijack the response object like this; clean this code up
      return {
        ...response,
        results: response.results.map((contact) => ({
          ...contact,
          associations: {
            companies: {
              results: (contactToCompaniesMap[contact.id] ?? []).map((id) => ({ id, type: 'contact_to_company' })),
            },
          },
        })),
      };
    });
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

  public async listLeads(updatedAfter?: Date): Promise<Readable> {
    return Readable.from([]);
  }

  public async createLead(params: RemoteLeadCreateParams): Promise<RemoteLead> {
    throw new Error('Not supported');
  }

  public async updateLead(params: RemoteLeadUpdateParams): Promise<RemoteLead> {
    throw new Error('Not supported');
  }

  public async listEvents(): Promise<Readable> {
    return Readable.from([]);
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

  public async listUsers(updatedAfter?: Date): Promise<Readable> {
    const passThrough = new PassThrough({ objectMode: true });

    (async () => {
      // Users
      {
        let after = undefined;
        do {
          const currResults: HubspotPaginatedOwners = await this.#listUsersImpl(after);
          const remoteUsers = currResults.results.map(fromHubspotOwnerToRemoteUser);
          after = currResults.paging?.next?.after;

          // Do not emit 'end' event until the last batch
          const readable = Readable.from(
            remoteUsers.filter((remoteUser) => {
              if (!updatedAfter) {
                return true;
              }

              if (!remoteUser.remoteUpdatedAt) {
                return true;
              }

              return updatedAfter < remoteUser.remoteUpdatedAt;
            })
          );
          readable.pipe(passThrough, { end: false });
          readable.on('error', (err) => passThrough.emit('error', err));

          // Wait
          await new Promise((resolve) => readable.on('end', resolve));
        } while (after);
      }
      // Archived Users
      // TODO: this doesn't respect the `updatedAfter` parameter because we can't use the search API for archived users
      {
        let after = undefined;
        do {
          const currResults: HubspotPaginatedOwners = await this.#listUsersImpl(after, /* archived */ true);
          const remoteUsers = currResults.results.map(fromHubspotOwnerToRemoteUser);
          after = currResults.paging?.next?.after;

          // Do not emit 'end' event until the last batch
          const readable = Readable.from(
            remoteUsers.filter((remoteUser) => {
              if (!updatedAfter) {
                return true;
              }

              if (!remoteUser.remoteUpdatedAt) {
                return true;
              }

              return updatedAfter < remoteUser.remoteUpdatedAt;
            })
          );
          readable.pipe(passThrough, { end: !after });
          readable.on('error', (err) => passThrough.emit('error', err));

          // Wait
          await new Promise((resolve) => readable.on('end', resolve));
        } while (after);
      }
    })().catch((err: unknown) => {
      // We need to forward the error to the returned `Readable` because there
      // is no way for the caller to find out about errors in the above async block otherwise.
      passThrough.emit('error', err);
    });

    return passThrough;
  }

  async #listUsersImpl(after?: string, archived?: boolean): Promise<HubspotPaginatedOwners> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const owners = await this.#client.crm.owners.ownersApi.getPage(
        /* email */ undefined,
        after,
        HUBSPOT_RECORD_LIMIT,
        archived
      );
      return owners;
    });
  }

  async #listAssociations(
    fromObjectType: string,
    toObjectType: string,
    fromObjectIds: string[]
  ): Promise<Record<string, string[]>> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const associations = await this.#client.crm.associations.batchApi.read(fromObjectType, toObjectType, {
        inputs: fromObjectIds.map((id) => ({ id })),
      });
      return associations.results
        .map((result) => ({ [result._from.id]: result.to.map(({ id }) => id) }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});
    });
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }
}

// TODO: We should pass in a type-narrowed CRMConnection
export function newClient(connection: CRMConnectionUnsafe, integration: Integration): HubSpotClient {
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

const isRateLimited = (e: any): boolean => {
  return e.code === 429;
};

const retryWhenRateLimited = async <Args extends any[], Return>(
  operation: (...operationParameters: Args) => Return,
  ...parameters: Args
): Promise<Return> => {
  const helper = async (bail: (e: Error) => void) => {
    try {
      return await operation(...parameters);
    } catch (e: any) {
      logger.error(e, 'Error encountered');
      if (!isRateLimited(e)) {
        bail(e);
        return null as Return;
      }
      throw e;
    }
  };
  return await retry(helper, ASYNC_RETRY_OPTIONS);
};
