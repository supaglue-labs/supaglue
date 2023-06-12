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
  CRMIntegration,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import {
  AccountCreateParams,
  AccountUpdateParams,
  AccountV2,
  ContactCreateParams,
  ContactUpdateParams,
  ContactV2,
  CRMCommonModelType,
  CRMCommonModelTypeMap,
  LeadCreateParams,
  LeadUpdateParams,
  LeadV2,
  OpportunityCreateParams,
  OpportunityUpdateParams,
  OpportunityV2,
  UserV2,
} from '@supaglue/types/crm';
import { Association, AssociationCreateParams } from '@supaglue/types/crm/association';
import { AssociationType, AssociationTypeCreateParams, ObjectClass } from '@supaglue/types/crm/association_type';
import { CustomObject, CustomObjectCreateParams, CustomObjectUpdateParams } from '@supaglue/types/crm/custom_object';
import {
  CustomObjectClass,
  CustomObjectClassCreateParams,
  CustomObjectClassUpdateParams,
  CustomObjectFieldType,
} from '@supaglue/types/crm/custom_object_class';
import retry from 'async-retry';
import { Readable } from 'stream';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../errors';
import { ASYNC_RETRY_OPTIONS, intersection, logger, REFRESH_TOKEN_THRESHOLD_MS } from '../../../lib';
import { paginator } from '../../utils/paginator';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';
import {
  fromHubSpotCompanyToAccountV2,
  fromHubSpotContactToRemoteContact,
  fromHubSpotDealToOpportunityV2,
  fromHubspotOwnerToUserV2,
  fromObjectClassToHubspotObjectType,
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

const propertiesToFetch = {
  company: [
    'name',
    'hubspot_owner_id',
    'description',
    'industry',
    'website',
    'domain',
    'hs_additional_domains',
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

export type PipelineStageMapping = Record<string, { label: string; stageIdsToLabels: Record<string, string> }>;

type HubspotClientConfig = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
  syncAllFields?: boolean;
};

class HubSpotClient extends AbstractCrmRemoteClient {
  readonly #client: Client;
  readonly #config: HubspotClientConfig;

  public constructor(config: HubspotClientConfig) {
    super('https://api.hubapi.com');
    const { accessToken } = config;
    this.#client = new Client({
      accessToken,
    });
    this.#config = config;
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#config.accessToken}`,
    };
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (!this.#config.expiresAt || Date.parse(this.#config.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS) {
      const token = await this.#client.oauth.tokensApi.createToken(
        'refresh_token',
        undefined,
        undefined,
        this.#config.clientId,
        this.#config.clientSecret,
        this.#config.refreshToken
      );
      const newAccessToken = token.accessToken;
      const newExpiresAt = new Date(Date.now() + token.expiresIn * 1000).toISOString();
      this.#config.accessToken = newAccessToken;
      this.#config.expiresAt = newExpiresAt;
      this.#client.setAccessToken(newAccessToken);
      this.emit('token_refreshed', newAccessToken, newExpiresAt);
    }
  }

  public override async listCommonModelRecords(
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
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async getCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    switch (commonModelType) {
      case 'account':
        return this.getAccount(id);
      case 'contact':
        return this.getContact(id);
      case 'lead':
        throw new Error('Cannot get leads in HubSpot');
      case 'opportunity':
        return this.getOpportunity(id);
      case 'user':
        return this.getUser(id);
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async createCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
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
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async updateCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<string> {
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
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  private async getCommonModelSchema(objectType: (typeof HUBSPOT_OBJECT_TYPES)[number]) {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await this.#client.crm.properties.coreApi.getAll(objectType);
      return response.results.map(({ name }) => name);
    });
  }

  private async getPropertiesToFetch(objectType: (typeof HUBSPOT_OBJECT_TYPES)[number]) {
    const availableProperties = await this.getCommonModelSchema(objectType);
    if (this.#config.syncAllFields) {
      return availableProperties;
    }
    return intersection(availableProperties, propertiesToFetch[objectType]);
  }

  public async listAccounts(updatedAfter?: Date): Promise<Readable> {
    const properties = await this.getPropertiesToFetch('company');
    const normalPageFetcher = await this.#getListNormalAccountsFetcher(properties, updatedAfter);
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listAccountsFull(properties, /* archived */ true, after);
      return filterForArchivedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((result) => ({
              object: fromHubSpotCompanyToAccountV2(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((result) => ({
              object: fromHubSpotCompanyToAccountV2(result),
              emittedAt,
            }))
          );
        },
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

  public async getAccount(id: string): Promise<AccountV2> {
    const properties = await this.getPropertiesToFetch('company');
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.getById(id, properties);
    return fromHubSpotCompanyToAccountV2(company);
  }

  public async createAccount(params: AccountCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.companies.basicApi.create({
      properties: toHubspotAccountCreateParams(params),
    });
    return response.id;
  }

  public async updateAccount(params: AccountUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.companies.basicApi.update(params.id, {
      properties: toHubspotAccountUpdateParams(params),
    });
    return response.id;
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
    const properties = await this.getPropertiesToFetch('deal');
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const normalPageFetcher = await this.#getListNormalOpportunitiesFetcher(properties, updatedAfter);
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listOpportunitiesFull(properties, /* archived */ true, after);
      return filterForArchivedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((deal) => ({
              object: fromHubSpotDealToOpportunityV2(deal, pipelineStageMapping),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((deal) => ({
              object: fromHubSpotDealToOpportunityV2(deal, pipelineStageMapping),
              emittedAt,
            }))
          );
        },
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

  public async getOpportunity(id: string, pipelineStageMapping?: PipelineStageMapping): Promise<OpportunityV2> {
    if (!pipelineStageMapping) {
      pipelineStageMapping = await this.#getPipelineStageMapping();
    }
    const properties = await this.getPropertiesToFetch('deal');
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.getById(
      id,
      properties,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return fromHubSpotDealToOpportunityV2(deal, pipelineStageMapping);
  }

  public async createOpportunity(params: OpportunityCreateParams): Promise<string> {
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
    return deal.id;
  }

  public async updateOpportunity(params: OpportunityUpdateParams): Promise<string> {
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.update(params.id, {
      properties: toHubspotOpportunityUpdateParams(params, pipelineStageMapping),
    });
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.deals.associationsApi.create(parseInt(deal.id), 'company', parseInt(params.accountId), [
        { associationCategory: 'HUBSPOT_DEFINED', associationTypeId: OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID },
      ]);
    }
    return deal.id;
  }

  public async listContacts(updatedAfter?: Date): Promise<Readable> {
    const properties = await this.getPropertiesToFetch('contact');
    const normalPageFetcher = await this.#getListNormalContactsFetcher(properties, updatedAfter);
    const archivedPageFetcher = async (after?: string) => {
      const response = await this.#listContactsFull(properties, /* archived */ true, after);
      return filterForArchivedAfter(response, updatedAfter);
    };

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((result) => ({ object: fromHubSpotContactToRemoteContact(result), emittedAt }))
          );
        },
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((result) => ({ object: fromHubSpotContactToRemoteContact(result), emittedAt }))
          );
        },
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

  public async getContact(id: string): Promise<ContactV2> {
    const properties = await this.getPropertiesToFetch('contact');
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.getById(
      id,
      properties,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return fromHubSpotContactToRemoteContact(contact);
  }

  public async createContact(params: ContactCreateParams): Promise<string> {
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
    return contact.id;
  }

  public async updateContact(params: ContactUpdateParams): Promise<string> {
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
    return contact.id;
  }

  public async listLeads(updatedAfter?: Date): Promise<Readable> {
    return Readable.from([]);
  }

  public async createLead(params: LeadCreateParams): Promise<LeadV2> {
    throw new Error('Not supported');
  }

  public async updateLead(params: LeadUpdateParams): Promise<LeadV2> {
    throw new Error('Not supported');
  }

  public async getUser(id: string): Promise<UserV2> {
    const owner = await this.#client.crm.owners.ownersApi.getById(parseInt(id));
    return fromHubspotOwnerToUserV2(owner);
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
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((result) => ({
              object: fromHubspotOwnerToUserV2(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((result) => ({
              object: fromHubspotOwnerToUserV2(result),
              emittedAt,
            }))
          );
        },
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

  public override async getCustomObjectClass(id: string): Promise<CustomObjectClass> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.schemas.coreApi.getById(id);
    return {
      id: response.objectTypeId,
      name: response.name,
      description: null,
      labels: {
        singular: response.labels.singular ?? '',
        plural: response.labels.plural ?? '',
      },
      fields: response.properties
        .filter((property) => property.createdUserId && !property.hidden) // hack to filter for only user-created properties; might not be accurate
        .map((property) => ({
          keyName: property.name,
          displayName: property.label,
          fieldType: property.type as CustomObjectFieldType, // TODO
          isRequired: response.requiredProperties.includes(property.name),
        })),
    };
  }

  public override async createCustomObjectClass(params: CustomObjectClassCreateParams): Promise<string> {
    if (!params.fields.length) {
      throw new Error('Cannot create custom object class with no fields');
    }

    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.schemas.coreApi.create({
      name: params.name,
      labels: params.labels,
      primaryDisplayProperty: params.fields[0].keyName, // this is a hack
      properties: params.fields.map((field) => ({
        name: field.keyName,
        label: field.displayName,
        type: field.fieldType,
        fieldType: field.fieldType === 'number' ? 'number' : 'text', // TODO: support field formats
      })),
      requiredProperties: params.fields.filter((field) => field.isRequired).map((field) => field.keyName),
      searchableProperties: [],
      secondaryDisplayProperties: [],
      associatedObjects: [],
    });
    return response.objectTypeId;
  }

  public override async updateCustomObjectClass(params: CustomObjectClassUpdateParams): Promise<void> {
    await this.maybeRefreshAccessToken();

    // Only update fields that have changed; for example, if you pass in the same
    // labels as the existing class, hubspot will throw an error.
    const existingClass = await this.getCustomObjectClass(params.id);

    const labels =
      params.labels.singular === existingClass.labels.singular && params.labels.plural === existingClass.labels.plural
        ? undefined
        : params.labels;

    // Update the main class
    await this.#client.crm.schemas.coreApi.update(params.id, {
      // ignoring name because you can't update that in hubspot
      labels,
      requiredProperties: params.fields.filter((field) => field.isRequired).map((field) => field.keyName),
    });

    // Figure out which fields to create/update/delete
    const fieldNamesToDelete = existingClass.fields
      .map((field) => field.keyName)
      .filter((keyName) => {
        return !params.fields.map((field) => field.keyName).includes(keyName);
      });
    const fieldsToUpdate = params.fields.filter((field) => {
      const existingField = existingClass.fields.find((f) => f.keyName === field.keyName);
      if (!existingField) {
        return false;
      }

      return (
        field.displayName !== existingField.displayName ||
        field.fieldType !== existingField.fieldType ||
        field.isRequired !== existingField.isRequired
      );
    });
    const fieldsToCreate = params.fields.filter(
      (field) => !existingClass.fields.map((f) => f.keyName).includes(field.keyName)
    );

    // Delete fields
    await this.#client.crm.properties.batchApi.archive(params.id, {
      inputs: fieldNamesToDelete.map((keyName) => ({ name: keyName })),
    });

    // Update fields
    for (const field of fieldsToUpdate) {
      await this.#client.crm.properties.coreApi.update(params.id, field.keyName, {
        label: field.displayName,
        type: field.fieldType,
        fieldType: field.fieldType === 'number' ? 'number' : 'text', // TODO: support field formats
      });
    }

    // Create fields
    // TODO: We should not assume that there is only one group
    const { results: groups } = await this.#client.crm.properties.groupsApi.getAll(params.id);
    const unarchivedGroups = groups.filter((group) => !group.archived);
    if (!unarchivedGroups.length || unarchivedGroups.length > 1) {
      throw new Error('Expected exactly one property group');
    }

    await this.#client.crm.properties.batchApi.create(params.id, {
      inputs: fieldsToCreate.map((field) => ({
        name: field.keyName,
        label: field.displayName,
        type: field.fieldType,
        fieldType: field.fieldType === 'number' ? 'number' : 'text', // TODO: support field formats
        groupName: unarchivedGroups[0].name, // TODO
      })),
    });
  }

  public override async getCustomObject(classId: string, id: string): Promise<CustomObject> {
    await this.maybeRefreshAccessToken();

    // Get the properties to fetch
    const customObjectClass = await this.getCustomObjectClass(classId);
    const fieldsToFetch = customObjectClass.fields.map((field) => field.keyName);
    const response = await this.#client.crm.objects.basicApi.getById(classId, id, fieldsToFetch);

    return {
      id: response.id,
      classId,
      fields: Object.fromEntries(Object.entries(response.properties).filter(([key]) => fieldsToFetch.includes(key))),
    };
  }

  public override async createCustomObject(params: CustomObjectCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.objects.basicApi.create(params.classId, {
      properties: params.fields as Record<string, string>, // TODO: map types?
    });
    return response.id;
  }

  public override async updateCustomObject(params: CustomObjectUpdateParams): Promise<void> {
    await this.maybeRefreshAccessToken();
    await this.#client.crm.objects.basicApi.update(params.classId, params.id, {
      properties: params.fields as Record<string, string>, // TODO: map types?
    });
  }

  public async getAssociationTypes(
    sourceObjectClass: ObjectClass,
    targetObjectClass: ObjectClass
  ): Promise<AssociationType[]> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.associations.v4.definitionsApi.getAll(
      fromObjectClassToHubspotObjectType(sourceObjectClass),
      fromObjectClassToHubspotObjectType(targetObjectClass)
    );
    return response.results.map((result) => ({
      id: result.typeId.toString(),
      sourceObjectClass,
      targetObjectClass,
      displayName: result.label ?? '',
      cardinality: 'UNKNOWN',
    }));
  }

  public async createAssociationType(params: AssociationTypeCreateParams): Promise<void> {
    if (params.cardinality !== 'ONE_TO_MANY') {
      throw new BadRequestError('Only ONE_TO_MANY cardinality is supported in HubSpot');
    }

    await this.maybeRefreshAccessToken();
    await this.#client.crm.associations.v4.definitionsApi.create(
      fromObjectClassToHubspotObjectType(params.sourceObjectClass),
      fromObjectClassToHubspotObjectType(params.targetObjectClass),
      {
        label: params.displayName,
        name: params.keyName,
      }
    );
  }

  public async createAssociation(params: AssociationCreateParams): Promise<Association> {
    await this.maybeRefreshAccessToken();

    await this.#client.crm.associations.v4.batchApi.create(
      fromObjectClassToHubspotObjectType(params.sourceObject.objectClass),
      fromObjectClassToHubspotObjectType(params.targetObject.objectClass),
      {
        inputs: [
          {
            _from: { id: params.sourceObject.id },
            to: { id: params.targetObject.id },
            types: [
              {
                associationCategory: 'USER_DEFINED', // TODO: does this work all the time?
                associationTypeId: parseInt(params.associationTypeId),
              },
            ],
          },
        ],
      }
    );

    return params;
  }

  public handleErr(err: unknown): unknown {
    const error = err as any;

    switch (error.code) {
      case 400:
        return new BadRequestError(error.message);
      case 401:
        return new UnauthorizedError(error.message);
      case 403:
        return new ForbiddenError(error.message);
      case 404:
        return new NotFoundError(error.message);
      case 409:
        return new ConflictError(error.message);
      case 429:
        return new TooManyRequestsError(error.message);
      default:
        return error;
    }
  }
}

export function newClient(connection: ConnectionUnsafe<'hubspot'>, integration: CRMIntegration): HubSpotClient {
  return new HubSpotClient({
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    expiresAt: connection.credentials.expiresAt,
    clientId: integration.config.oauth.credentials.oauthClientId,
    clientSecret: integration.config.oauth.credentials.oauthClientSecret,
    syncAllFields: integration.config.sync.syncAllFields,
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
      if (isRateLimited(e)) {
        logger.warn(e, `Encountered Hubspot rate limiting.`);
        throw new TooManyRequestsError(`Encountered Hubspot rate limiting.`);
      }

      logger.warn(e, `Encountered Hubspot error.`);
      bail(e);
      return null as Return;
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
