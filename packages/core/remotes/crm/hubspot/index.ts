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
  ConnectionUnsafe,
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
import { Readable } from 'stream';
import { ASYNC_RETRY_OPTIONS, logger } from '../../../lib';
import { paginator } from '../../utils/paginator';
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

const HUBSPOT_OBJECT_TYPES = ['company', 'contact', 'deal'] as const;

// TODO: We may need to fetch this from the hubspot schema
const CONTACT_TO_PRIMARY_COMPANY_ASSOCIATION_ID = 1;
const OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID = 5;

export type PipelineStageMapping = Record<string, { label: string; stageIdsToLabels: Record<string, string> }>;

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

  private async getCommonModelSchema(objectType: (typeof HUBSPOT_OBJECT_TYPES)[number]) {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await this.#client.crm.properties.coreApi.getAll(objectType);
      return response.results.map(({ name }) => name);
    });
  }

  public async listAccounts(updatedAfter?: Date): Promise<Readable> {
    const properties = await this.getCommonModelSchema('company');
    const normalPageFetcher = await this.#getListNormalAccountsFetcher(properties, updatedAfter);
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listAccountsFull(properties, /* archived */ true, after);
      return filterForArchivedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotCompanyToRemoteAccount)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotCompanyToRemoteAccount)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  async #getListNormalAccountsFetcher(
    properties: string[],
    updatedAfter?: Date
  ): Promise<(after?: string) => Promise<HubspotPaginatedCompanies>> {
    if (updatedAfter) {
      // Incremental uses the Search endpoint which doesn't allow for more than 10k results.
      // If we get back more than 10k results, we need to fall back to the full fetch.
      const response = await this.#listAccountsIncremental(properties, updatedAfter, 0);
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        return async (after?: string) => {
          const response = await this.#listAccountsFull(properties, /* archived */ false, after);
          return filterForUpdatedAfter(response, updatedAfter);
        };
      }
      return this.#listAccountsIncremental.bind(this, properties, updatedAfter, HUBSPOT_RECORD_LIMIT);
    }

    return this.#listAccountsFull.bind(this, properties, /* archived */ false);
  }

  async #listAccountsFull(properties: string[], archived: boolean, after?: string): Promise<HubspotPaginatedCompanies> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const companies = await this.#client.crm.companies.basicApi.getPage(
        HUBSPOT_RECORD_LIMIT,
        after,
        properties,
        undefined,
        undefined,
        archived
      );
      return companies;
    });
  }

  async #listAccountsIncremental(
    properties: string[],
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
        properties,
        limit,
        after: after as unknown as number, // hubspot sdk has wrong types https://github.com/HubSpot/hubspot-api-nodejs/issues/350
      });
      return companies;
    });
  }

  private async getAccount(remoteId: string): Promise<RemoteAccount> {
    const properties = await this.getCommonModelSchema('company');
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.getById(remoteId, properties);
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

  async #getPipelineStageMapping(): Promise<
    Record<string, { label: string; stageIdsToLabels: Record<string, string> }>
  > {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await this.#client.crm.pipelines.pipelinesApi.getAll('deal');
      const pipelineStageMapping: PipelineStageMapping = {};
      response.results.forEach((pipeline) => {
        const stageIdsToLabels: Record<string, string> = {};
        pipeline.stages.forEach((stage) => {
          stageIdsToLabels[stage.id] = stage.label;
        });

        pipelineStageMapping[pipeline.id] = { label: pipeline.label, stageIdsToLabels };
      });
      return pipelineStageMapping;
    });
  }

  public async listOpportunities(updatedAfter?: Date): Promise<Readable> {
    const properties = await this.getCommonModelSchema('deal');
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const normalPageFetcher = await this.#getListNormalOpportunitiesFetcher(properties, updatedAfter);
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listOpportunitiesFull(properties, /* archived */ true, after);
      return filterForArchivedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) =>
          Readable.from(response.results.map((deal) => fromHubSpotDealToRemoteOpportunity(deal, pipelineStageMapping))),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) =>
          Readable.from(response.results.map((deal) => fromHubSpotDealToRemoteOpportunity(deal, pipelineStageMapping))),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  async #getListNormalOpportunitiesFetcher(
    properties: string[],
    updatedAfter?: Date
  ): Promise<(after?: string) => Promise<HubspotPaginatedDeals>> {
    if (updatedAfter) {
      // Incremental uses the Search endpoint which doesn't allow for more than 10k results.
      // If we get back more than 10k results, we need to fall back to the full fetch.
      const response = await this.#listOpportunitiesIncremental(properties, updatedAfter, 0);
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        return async (after?: string) => {
          const response = await this.#listOpportunitiesFull(properties, /* archived */ false, after);
          return filterForUpdatedAfter(response, updatedAfter);
        };
      }
      return this.#listOpportunitiesIncremental.bind(this, properties, updatedAfter, HUBSPOT_RECORD_LIMIT);
    }

    return this.#listOpportunitiesFull.bind(this, properties, /* archived */ false);
  }

  async #listOpportunitiesFull(
    properties: string[],
    archived: boolean,
    after?: string
  ): Promise<HubspotPaginatedDeals> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const deals = await this.#client.crm.deals.basicApi.getPage(
        HUBSPOT_RECORD_LIMIT,
        after,
        properties,
        /* propertiesWithHistory */ undefined,
        /* associations */ ['company'],
        archived
      );
      return deals;
    });
  }

  async #listOpportunitiesIncremental(
    properties: string[],
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
        properties,
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

  private async getOpportunity(
    remoteId: string,
    pipelineStageMapping?: PipelineStageMapping
  ): Promise<RemoteOpportunity> {
    if (!pipelineStageMapping) {
      pipelineStageMapping = await this.#getPipelineStageMapping();
    }
    const properties = await this.getCommonModelSchema('deal');
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.getById(
      remoteId,
      properties,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return fromHubSpotDealToRemoteOpportunity(deal, pipelineStageMapping);
  }

  public async createOpportunity(params: RemoteOpportunityCreateParams): Promise<RemoteOpportunity> {
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.create({
      properties: toHubspotOpportunityCreateParams(params, pipelineStageMapping),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.deals.associationsApi.create(parseInt(deal.id), 'company', parseInt(params.accountId), [
        { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID },
      ]);
    }
    return await this.getOpportunity(deal.id, pipelineStageMapping);
  }

  public async updateOpportunity(params: RemoteOpportunityUpdateParams): Promise<RemoteOpportunity> {
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.update(params.remoteId, {
      properties: toHubspotOpportunityUpdateParams(params, pipelineStageMapping),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.deals.associationsApi.create(parseInt(deal.id), 'company', parseInt(params.accountId), [
        { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID },
      ]);
    }
    return await this.getOpportunity(deal.id, pipelineStageMapping);
  }

  public async listContacts(updatedAfter?: Date): Promise<Readable> {
    const properties = await this.getCommonModelSchema('contact');
    const normalPageFetcher = await this.#getListNormalContactsFetcher(properties, updatedAfter);
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listContactsFull(properties, /* archived */ true, after);
      return filterForArchivedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotContactToRemoteContact)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubSpotContactToRemoteContact)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  async #getListNormalContactsFetcher(
    properties: string[],
    updatedAfter?: Date
  ): Promise<(after?: string) => Promise<HubspotPaginatedContacts>> {
    if (updatedAfter) {
      // Incremental uses the Search endpoint which doesn't allow for more than 10k results.
      // If we get back more than 10k results, we need to fall back to the full fetch.
      const response = await this.#listContactsIncremental(properties, updatedAfter, 0);
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        return async (after?: string) => {
          const response = await this.#listContactsFull(properties, /* archived */ false, after);
          return filterForUpdatedAfter(response, updatedAfter);
        };
      }
      return this.#listContactsIncremental.bind(this, properties, updatedAfter, HUBSPOT_RECORD_LIMIT);
    }

    return this.#listContactsFull.bind(this, properties, /* archived */ false);
  }

  async #listContactsFull(properties: string[], archived: boolean, after?: string): Promise<HubspotPaginatedContacts> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const contacts = await this.#client.crm.contacts.basicApi.getPage(
        HUBSPOT_RECORD_LIMIT,
        after,
        properties,
        /* propertiesWithHistory */ undefined,
        /* associations */ ['company'],
        archived
      );
      return contacts;
    });
  }

  async #listContactsIncremental(
    properties: string[],
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
        properties,
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
    const properties = await this.getCommonModelSchema('contact');
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.getById(
      remoteId,
      properties,
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
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubspotOwnerToRemoteUser)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results.map(fromHubspotOwnerToRemoteUser)),
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

function filterForArchivedAfter<
  R extends {
    results: { archivedAt?: Date }[];
  }
>(response: R, archivedAfter?: Date): R {
  return {
    ...response,
    results: response.results.filter((record) => {
      if (!archivedAfter) {
        return true;
      }

      if (!record.archivedAt) {
        return true;
      }

      return archivedAfter < record.archivedAt;
    }),
  };
}
