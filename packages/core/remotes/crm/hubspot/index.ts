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
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  ConnectionUnsafe,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  CRMCommonModelType,
  CRMCommonModelTypeMap,
  Integration,
  Opportunity,
  OpportunityCreateParams,
  OpportunityUpdateParams,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import retry from 'async-retry';
import { Readable } from 'stream';
import { ASYNC_RETRY_OPTIONS, logger } from '../../../lib';
import { paginator } from '../../utils/paginator';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';
import {
  fromHubSpotCompanyToAccount,
  fromHubSpotContactToContact,
  fromHubSpotDealToOpportunity,
  fromHubspotOwnerToUser,
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

  public override async listObjects(
    commonModelType: CRMCommonModelType,
    updatedAfter?: Date | undefined
  ): Promise<Readable> {
    switch (commonModelType) {
      case 'account':
        return this.listAccounts(updatedAfter);
      case 'contact':
        return this.listContacts(updatedAfter);
      case 'lead':
        return this.listLeads(updatedAfter);
      case 'opportunity':
        return this.listOpportunities(updatedAfter);
      case 'user':
        return this.listUsers();
      case 'event':
        return this.listEvents();
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async createObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    switch (commonModelType) {
      case 'account':
        return this.createAccount(params);
      case 'contact':
        return this.createContact(params);
      case 'lead':
        throw new Error('Cannot create leads in HubSpot');
      case 'opportunity':
        return this.createOpportunity(params);
      case 'user':
        throw new Error('Cannot create users in HubSpot');
      case 'event':
        throw new Error('Cannot create events in HubSpot');
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async updateObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    switch (commonModelType) {
      case 'account':
        return this.updateAccount(params);
      case 'contact':
        return this.updateContact(params);
      case 'lead':
        throw new Error('Cannot update leads in HubSpot');
      case 'opportunity':
        return this.updateOpportunity(params);
      case 'user':
        throw new Error('Cannot update users in HubSpot');
      case 'event':
        throw new Error('Cannot update events in HubSpot');
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public async listAccounts(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = await this.#getListNormalAccountsFetcher(updatedAfter);
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listAccountsFull(/* archived */ true, after);
      return filterForUpdatedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotCompanyToAccount)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotCompanyToAccount)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  async #getListNormalAccountsFetcher(
    updatedAfter?: Date
  ): Promise<(after?: string) => Promise<HubspotPaginatedCompanies>> {
    if (updatedAfter) {
      // Incremental uses the Search endpoint which doesn't allow for more than 10k results.
      // If we get back more than 10k results, we need to fall back to the full fetch.
      const response = await this.#listAccountsIncremental(updatedAfter, 0);
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        return async (after?: string) => {
          const response = await this.#listAccountsFull(/* archived */ false, after);
          return filterForUpdatedAfter(response, updatedAfter);
        };
      }
      return this.#listAccountsIncremental.bind(this, updatedAfter, HUBSPOT_RECORD_LIMIT);
    }

    return this.#listAccountsFull.bind(this, /* archived */ false);
  }

  async #listAccountsFull(archived: boolean, after?: string): Promise<HubspotPaginatedCompanies> {
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

  async #listAccountsIncremental(
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

  private async getAccount(id: string): Promise<Account> {
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.getById(id, propertiesToFetch.company);
    return fromHubSpotCompanyToAccount(company);
  }

  public async createAccount(params: AccountCreateParams): Promise<Account> {
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.create({
      properties: toHubspotAccountCreateParams(params),
    });
    return await this.getAccount(company.id);
  }

  public async updateAccount(params: AccountUpdateParams): Promise<Account> {
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.update(params.id, {
      properties: toHubspotAccountUpdateParams(params),
    });
    return await this.getAccount(company.id);
  }

  public async listOpportunities(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = await this.#getListNormalOpportunitiesFetcher(updatedAfter);
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listOpportunitiesFull(/* archived */ true, after);
      return filterForUpdatedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotDealToOpportunity)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotDealToOpportunity)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  async #getListNormalOpportunitiesFetcher(
    updatedAfter?: Date
  ): Promise<(after?: string) => Promise<HubspotPaginatedDeals>> {
    if (updatedAfter) {
      // Incremental uses the Search endpoint which doesn't allow for more than 10k results.
      // If we get back more than 10k results, we need to fall back to the full fetch.
      const response = await this.#listOpportunitiesIncremental(updatedAfter, 0);
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        return async (after?: string) => {
          const response = await this.#listOpportunitiesFull(/* archived */ false, after);
          return filterForUpdatedAfter(response, updatedAfter);
        };
      }
      return this.#listOpportunitiesIncremental.bind(this, updatedAfter, HUBSPOT_RECORD_LIMIT);
    }

    return this.#listOpportunitiesFull.bind(this, /* archived */ false);
  }

  async #listOpportunitiesFull(archived: boolean, after?: string): Promise<HubspotPaginatedDeals> {
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

  async #listOpportunitiesIncremental(
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

  private async getOpportunity(id: string): Promise<Opportunity> {
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.getById(
      id,
      propertiesToFetch.deal,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return fromHubSpotDealToOpportunity(deal);
  }

  public async createOpportunity(params: OpportunityCreateParams): Promise<Opportunity> {
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

  public async updateOpportunity(params: OpportunityUpdateParams): Promise<Opportunity> {
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.update(params.id, {
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
    const normalPageFetcher = await this.#getListNormalContactsFetcher(updatedAfter);
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listContactsFull(/* archived */ true, after);
      return filterForUpdatedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotContactToContact)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotContactToContact)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  async #getListNormalContactsFetcher(
    updatedAfter?: Date
  ): Promise<(after?: string) => Promise<HubspotPaginatedContacts>> {
    if (updatedAfter) {
      // Incremental uses the Search endpoint which doesn't allow for more than 10k results.
      // If we get back more than 10k results, we need to fall back to the full fetch.
      const response = await this.#listContactsIncremental(updatedAfter, 0);
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        return async (after?: string) => {
          const response = await this.#listContactsFull(/* archived */ false, after);
          return filterForUpdatedAfter(response, updatedAfter);
        };
      }
      return this.#listContactsIncremental.bind(this, updatedAfter, HUBSPOT_RECORD_LIMIT);
    }

    return this.#listContactsFull.bind(this, /* archived */ false);
  }

  async #listContactsFull(archived: boolean, after?: string): Promise<HubspotPaginatedContacts> {
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

  async #listContactsIncremental(
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

  private async getContact(id: string): Promise<Contact> {
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.getById(
      id,
      propertiesToFetch.contact,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return fromHubSpotContactToContact(contact);
  }

  public async createContact(params: ContactCreateParams): Promise<Contact> {
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

  public async updateContact(params: ContactUpdateParams): Promise<Contact> {
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.update(params.id, {
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

  public async listEvents(): Promise<Readable> {
    return Readable.from([]);
  }

  public async listUsers(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = async (after?: string) => {
      const response = await this.#listUsersFull(/* archived */ false, after);
      return filterForUpdatedAfter(response, updatedAfter);
    };
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listUsersFull(/* archived */ true, after);
      return filterForUpdatedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubspotOwnerToUser)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubspotOwnerToUser)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  async #listUsersFull(archived: boolean, after?: string): Promise<HubspotPaginatedOwners> {
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

export function newClient(connection: ConnectionUnsafe<'hubspot'>, integration: Integration): HubSpotClient {
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
      logger.error(e, `Error encountered: ${e.message}`);
      if (!isRateLimited(e)) {
        bail(e);
        return null as Return;
      }
      throw e;
    }
  };
  return await retry(helper, ASYNC_RETRY_OPTIONS);
};

function filterForUpdatedAfter<
  R extends {
    results: { updatedAt?: Date }[];
  }
>(response: R, updatedAfter?: Date): R {
  return {
    ...response,
    results: response.results.filter((record) => {
      if (!updatedAfter) {
        return true;
      }

      if (!record.updatedAt) {
        return true;
      }

      return updatedAfter < record.updatedAt;
    }),
  };
}
