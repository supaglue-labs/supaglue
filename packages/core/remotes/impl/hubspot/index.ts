import { Client } from '@hubspot/api-client';
import type {
  CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedCompanies,
  CollectionResponseWithTotalSimplePublicObjectForwardPaging as HubspotPaginatedCompaniesWithTotal,
} from '@hubspot/api-client/lib/codegen/crm/companies';
import type {
  CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedContacts,
  CollectionResponseWithTotalSimplePublicObjectForwardPaging as HubspotPaginatedContactsWithTotal,
} from '@hubspot/api-client/lib/codegen/crm/contacts';
import type {
  CollectionResponseSimplePublicObjectWithAssociationsForwardPaging as HubspotPaginatedDeals,
  CollectionResponseWithTotalSimplePublicObjectForwardPaging as HubspotPaginatedDealsWithTotal,
} from '@hubspot/api-client/lib/codegen/crm/deals';
import type { CollectionResponsePublicOwnerForwardPaging as HubspotPaginatedOwners } from '@hubspot/api-client/lib/codegen/crm/owners';
import type {
  CommonObjectDef,
  ConnectionUnsafe,
  CRMProvider,
  NormalizedRawRecord,
  Property,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
  StandardOrCustomObjectDef,
} from '@supaglue/types';
import type {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  Lead,
  LeadCreateParams,
  LeadUpdateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityUpdateParams,
  User,
} from '@supaglue/types/crm';
import type { Association, AssociationCreateParams } from '@supaglue/types/crm/association';
import type { AssociationType, AssociationTypeCreateParams, SGObject } from '@supaglue/types/crm/association_type';
import type {
  CustomObject,
  CustomObjectCreateParams,
  CustomObjectFieldType,
  CustomObjectUpdateParams,
} from '@supaglue/types/crm/custom_object';
import type {
  CustomObjectRecord,
  CustomObjectRecordCreateParams,
  CustomObjectRecordUpdateParams,
} from '@supaglue/types/crm/custom_object_record';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { HUBSPOT_STANDARD_OBJECT_TYPES } from '@supaglue/utils';
import retry from 'async-retry';
import axios from 'axios';
import { Readable } from 'stream';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../errors';
import {
  ASYNC_RETRY_OPTIONS,
  intersection,
  logger,
  REFRESH_TOKEN_THRESHOLD_MS,
  retryWhenAxiosRateLimited,
} from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';
import { paginator } from '../../utils/paginator';
import {
  fromHubSpotCompanyToAccount,
  fromHubSpotContactToContact,
  fromHubSpotDealToOpportunity,
  fromHubspotOwnerToUser,
  fromObjectToHubspotObjectType,
  toHubspotAccountCreateParams,
  toHubspotAccountUpdateParams,
  toHubspotContactCreateParams,
  toHubspotContactUpdateParams,
  toHubspotOpportunityCreateParams,
  toHubspotOpportunityUpdateParams,
} from './mappers';

const HUBSPOT_RECORD_LIMIT = 100;
const HUBSPOT_SEARCH_RESULTS_LIMIT = 10000;
const hubspotUserProperties: Property[] = [
  {
    id: 'id',
    label: 'Id',
  },
  {
    id: 'email',
    label: 'Email',
  },
  {
    id: 'firstName',
    label: 'First Name',
  },
  {
    id: 'lastName',
    label: 'Last Name',
  },
  {
    id: 'userId',
    label: 'User Id',
  },
  {
    id: 'createdAt',
    label: 'Created At',
  },
  {
    id: 'updatedAt',
    label: 'Updated At',
  },
  {
    id: 'archived',
    label: 'Archived',
  },
  {
    id: 'teams',
    label: 'Teams',
  },
];

const hubspotStandardObjectTypeToPlural: Record<HubSpotStandardObjectType, string> = {
  company: 'companies',
  contact: 'contacts',
  deal: 'deals',
  line_item: 'line items',
  product: 'products',
  ticket: 'tickets',
  quote: 'quotes',
  call: 'calls',
  communication: 'communications',
  email: 'emails',
  meeting: 'meetings',
  note: 'notes',
  postal_mail: 'postal mails',
  task: 'tasks',
};

const hubspotStandardObjectTypeToAssociatedStandardObjectTypes: Record<
  HubSpotStandardObjectType,
  HubSpotStandardObjectType[]
> = {
  company: ['contact'],
  contact: ['contact', 'company'],
  deal: ['contact', 'company', 'line_item'],
  line_item: ['deal'],
  product: [],
  ticket: ['contact', 'deal', 'company'],
  quote: [],
  call: ['contact', 'deal', 'company', 'ticket'],
  communication: ['contact', 'deal', 'company', 'ticket'],
  email: ['contact', 'deal', 'company', 'ticket'],
  meeting: ['contact', 'deal', 'company', 'ticket'],
  note: ['contact', 'deal', 'company', 'ticket'],
  postal_mail: ['contact', 'deal', 'company', 'ticket'],
  task: ['contact', 'deal', 'company', 'ticket'],
};

const archivedUnsupportedStandardObjectTypes: HubSpotStandardObjectType[] = [
  'postal_mail',
  'meeting',
  'note',
  'communication',
  'call',
  'email',
];

const HUBSPOT_STANDARD_OBJECT_TYPES_PLURALIZED = HUBSPOT_STANDARD_OBJECT_TYPES.map(
  (objectType) => hubspotStandardObjectTypeToPlural[objectType]
);

type HubSpotStandardObjectType = (typeof HUBSPOT_STANDARD_OBJECT_TYPES)[number];

type HubSpotCommonObjectObjectType = 'company' | 'contact' | 'deal';

type HubSpotCustomSchema = {
  labels: {
    singular: string;
    plural: string;
  };
  id: string;
  objectTypeId: string;
  fullyQualifiedName: string;
  archived: boolean;
  name: string;
};

type HubSpotAPIV3ListSchemasResponse = {
  results: HubSpotCustomSchema[];
};

type HubSpotPaging = {
  next?: {
    after?: string;
    link?: string;
  };
};

type HubSpotAPIV3ListResponseAssociationResult = {
  id: string;
  type: string;
};

type HubSpotAPIV3ListResponseResult = {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  archivedAt?: string;
  associations?: Record<string, { results: HubSpotAPIV3ListResponseAssociationResult[] }>;
};

type HubSpotAPIV3ListResponse = {
  results: HubSpotAPIV3ListResponseResult[];
  paging?: HubSpotPaging;
};

type RecordWithFlattenedAssociations = {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  archivedAt?: string;
  associations?: Record<string, string[]>;
};

type RecordsResponseWithFlattenedAssociations = {
  results: RecordWithFlattenedAssociations[];
  paging?: HubSpotPaging;
};

type NormalizedRecordsResponseWithFlattenedAssociations = {
  results: NormalizedRawRecord<RecordWithFlattenedAssociations>[];
  paging?: HubSpotPaging;
};

type RecordsResponseWithFlattenedAssociationsAndTotal = RecordsResponseWithFlattenedAssociations & {
  total: number;
};

type HubSpotAPIV3SearchResponseResult = {
  id: string;
  properties: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

type HubSpotAPIV3SearchResponse = {
  total: number;
  results: HubSpotAPIV3SearchResponseResult[];
  paging?: HubSpotPaging;
};

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

const isStandardObjectType = (objectType: string): objectType is HubSpotStandardObjectType =>
  HUBSPOT_STANDARD_OBJECT_TYPES.includes(objectType as HubSpotStandardObjectType);

const toStandardObjectType = (objectStr: string): HubSpotStandardObjectType => {
  if (!isStandardObjectType(objectStr)) {
    throw new Error(`Unsupported object type: ${objectStr}`);
  }
  return objectStr;
};

type HubspotClientConfig = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
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
      const newRefreshToken = token.refreshToken;
      const newExpiresAt = new Date(Date.now() + token.expiresIn * 1000).toISOString();

      this.#config.accessToken = newAccessToken;
      this.#config.refreshToken = newRefreshToken;
      this.#config.expiresAt = newExpiresAt;

      this.#client.setAccessToken(newAccessToken);
      this.emit('token_refreshed', {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
      });
    }
  }

  private async getStandardPropertyIdsToFetch(
    objectType: string,
    fieldMappingConfig?: FieldMappingConfig
  ): Promise<string[]> {
    const availableProperties = await this.listPropertiesForRawObjectName(objectType);
    const availablePropertyIds = availableProperties.map(({ id }) => id);
    if (!fieldMappingConfig || fieldMappingConfig.type === 'inherit_all_fields') {
      return availablePropertyIds;
    }
    const properties = fieldMappingConfig.fieldMappings.map((fieldMapping) => fieldMapping.mappedField);
    return intersection(availablePropertyIds, properties);
  }

  public override async listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const standardObjectType = toStandardObjectType(object);
    const propertiesToFetch = await this.getStandardPropertyIdsToFetch(object, fieldMappingConfig);
    const associatedStandardObjectTypes = hubspotStandardObjectTypeToAssociatedStandardObjectTypes[standardObjectType];

    const normalPageFetcher = await this.#getListRecordsFetcher(
      standardObjectType,
      propertiesToFetch,
      associatedStandardObjectTypes,
      /* associatedCustomObjectSchemas */ [], // TODO: should we sync custom object associations?
      /* archived */ false,
      modifiedAfter
    );

    const archivedPageFetcher = await this.#getListRecordsFetcher(
      standardObjectType,
      propertiesToFetch,
      associatedStandardObjectTypes,
      /* associatedCustomObjectSchemas */ [], // TODO: should we sync custom object associations?
      /* archived */ true,
      modifiedAfter
    );

    const normalFetcherAndHandler = {
      pageFetcher: normalPageFetcher,
      createStreamFromPage: (response: NormalizedRecordsResponseWithFlattenedAssociations) =>
        Readable.from(toMappedRecords(response.results, fieldMappingConfig)),
      getNextCursorFromPage: (response: NormalizedRecordsResponseWithFlattenedAssociations) =>
        response.paging?.next?.after,
    };

    if (archivedUnsupportedStandardObjectTypes.includes(standardObjectType)) {
      // Can't get archived records for these types
      return await paginator([normalFetcherAndHandler]);
    }

    return await paginator([
      normalFetcherAndHandler,
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => Readable.from(toMappedRecords(response.results, fieldMappingConfig)),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  async #getAllCustomObjectSchemas(): Promise<HubSpotCustomSchema[]> {
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await axios.get<HubSpotAPIV3ListSchemasResponse>(`${this.baseUrl}/crm/v3/schemas`, {
        headers: {
          Authorization: `Bearer ${this.#config.accessToken}`,
        },
      });

      return response.data.results.filter((result) => !result.archived);
    });
  }

  async #getObjectTypeIdByCustomObjectName(objectName: string): Promise<string> {
    const objectTypeSchemas = await this.#getAllCustomObjectSchemas();
    const matchingResult = objectTypeSchemas.find((result) => result.name === objectName);
    if (!matchingResult) {
      throw new BadRequestError(`Couldn't find object type with name: ${objectName}`);
    }

    return matchingResult.objectTypeId;
  }

  async #getAssociatedObjectTypesForCustomObject(fromObjectTypeId: string): Promise<{
    standardObjectTypes: string[];
    customObjectSchemas: HubSpotCustomSchema[];
  }> {
    // For each standard object type, see if there is an association type
    const standardObjectTypes: string[] = [];
    for (const toObjectType of HUBSPOT_STANDARD_OBJECT_TYPES) {
      await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        const response = await axios.get<HubSpotAPIV3ListResponse>(
          `${this.baseUrl}/crm/v4/associations/${fromObjectTypeId}/${toObjectType}/labels`,
          {
            headers: {
              Authorization: `Bearer ${this.#config.accessToken}`,
            },
          }
        );

        if (response.data.results.length) {
          standardObjectTypes.push(toObjectType);
        }
      });
    }

    // For each custom object type, see if there is an association type
    const allCustomObjectSchemas = await this.#getAllCustomObjectSchemas();
    const customObjectSchemas: HubSpotCustomSchema[] = [];
    for (const customObjectSchema of allCustomObjectSchemas) {
      if (fromObjectTypeId === customObjectSchema.objectTypeId) {
        continue;
      }

      await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        const response = await axios.get<HubSpotAPIV3ListResponse>(
          `${this.baseUrl}/crm/v4/associations/${fromObjectTypeId}/${customObjectSchema.objectTypeId}/labels`,
          {
            headers: {
              Authorization: `Bearer ${this.#config.accessToken}`,
            },
          }
        );

        if (response.data.results.length) {
          customObjectSchemas.push(customObjectSchema);
        }
      });
    }

    return { standardObjectTypes, customObjectSchemas };
  }

  public override async listCustomObjectRecords(
    object: string,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    // Look up the objectTypeId given the object name
    const objectTypeId = await this.#getObjectTypeIdByCustomObjectName(object);
    const propertiesToFetch = await this.listPropertiesForRawObjectName(objectTypeId);
    const propertyIds = propertiesToFetch.map(({ id }) => id);

    // Find the associated object types for the object
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForCustomObject(objectTypeId);

    const normalPageFetcher = await this.#getListRecordsFetcher(
      objectTypeId,
      propertyIds,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ false,
      modifiedAfter
    );

    const archivedPageFetcher = await this.#getListRecordsFetcher(
      objectTypeId,
      propertyIds,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ true,
      modifiedAfter
    );

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.results),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  async #getListRecordsFetcher(
    objectType: string,
    propertiesToFetch: string[],
    associatedStandardObjectTypes: string[],
    associatedCustomObjectSchemas: HubSpotCustomSchema[],
    archived: boolean,
    modifiedAfter?: Date
  ): Promise<(after?: string) => Promise<NormalizedRecordsResponseWithFlattenedAssociations>> {
    if (archived) {
      return async (after?: string) => {
        const response = await this.#fetchPageOfFullRecords(
          objectType,
          propertiesToFetch,
          associatedStandardObjectTypes,
          associatedCustomObjectSchemas,
          /* archived */ true,
          after
        );
        const filteredResponse = filterForArchivedAfterISOString(response, modifiedAfter);
        return normalizeResponse(filteredResponse);
      };
    }

    if (modifiedAfter) {
      // Incremental uses the Search endpoint which doesn't allow for more than 10k results.
      // If we get back more than 10k results, we need to fall back to the full fetch.
      const response = await this.#fetchPageOfIncrementalRecords(
        objectType,
        propertiesToFetch,
        associatedStandardObjectTypes,
        associatedCustomObjectSchemas,
        modifiedAfter,
        0
      );
      if (response.total > HUBSPOT_SEARCH_RESULTS_LIMIT) {
        return async (after?: string) => {
          const response = await this.#fetchPageOfFullRecords(
            objectType,
            propertiesToFetch,
            associatedStandardObjectTypes,
            associatedCustomObjectSchemas,
            /* archived */ false,
            after
          );
          const filteredResponse = filterForUpdatedAfterISOString(response, modifiedAfter);
          return normalizeResponse(filteredResponse);
        };
      }
      return async (after?: string) => {
        const response = await this.#fetchPageOfIncrementalRecords(
          objectType,
          propertiesToFetch,
          associatedStandardObjectTypes,
          associatedCustomObjectSchemas,
          modifiedAfter,
          HUBSPOT_RECORD_LIMIT,
          after
        );
        return normalizeResponse(response);
      };
    }

    return async (after?: string) => {
      const response = await this.#fetchPageOfFullRecords(
        objectType,
        propertiesToFetch,
        associatedStandardObjectTypes,
        associatedCustomObjectSchemas,
        /* archived */ false,
        after
      );
      return normalizeResponse(response);
    };
  }

  async #fetchPageOfFullRecords(
    objectType: string,
    propertiesToFetch: string[],
    associatedStandardObjectTypes: string[],
    associatedCustomObjectSchemas: HubSpotCustomSchema[],
    archived: boolean,
    after?: string
  ): Promise<RecordsResponseWithFlattenedAssociations> {
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const associations = [
        ...associatedStandardObjectTypes,
        ...associatedCustomObjectSchemas.map((s) => s.objectTypeId),
      ];
      const response = await axios.get<HubSpotAPIV3ListResponse>(`${this.baseUrl}/crm/v3/objects/${objectType}`, {
        params: {
          limit: HUBSPOT_RECORD_LIMIT,
          after,
          properties: propertiesToFetch.length ? propertiesToFetch.join(',') : undefined,
          associations: associations.length ? associations.join(',') : undefined,
          archived,
        },
        headers: {
          Authorization: `Bearer ${this.#config.accessToken}`,
        },
      });

      // Flatten associations
      return {
        ...response.data,
        results: response.data.results.map(({ associations, ...rest }) => ({
          ...rest,
          associations: Object.entries(associations ?? {}).reduce((acc, [associatedObjectType, { results }]) => {
            // If associatedObjectType is for a standard object, it will be pluralized
            if (HUBSPOT_STANDARD_OBJECT_TYPES_PLURALIZED.includes(associatedObjectType)) {
              acc[associatedObjectType] = results.map(({ id }) => id);
              return acc;
            }

            // If associatedObjectType is for a custom object, it will be the fullyQualifiedName,
            // and we want to use the objectTypeId for consistency
            const matchingCustomObjectSchema = associatedCustomObjectSchemas.find(
              (schema) => schema.fullyQualifiedName === associatedObjectType
            );
            if (!matchingCustomObjectSchema) {
              throw new Error(`Couldn't find matching custom object schema for ${associatedObjectType}`);
            }
            acc[matchingCustomObjectSchema.objectTypeId] = results.map(({ id }) => id);
            return acc;
          }, {} as Record<string, string[]>),
        })),
      };
    });
  }

  async #fetchPageOfIncrementalRecords(
    objectType: string,
    propertiesToFetch: string[],
    associatedStandardObjectTypes: string[],
    associatedCustomObjectSchemas: HubSpotCustomSchema[],
    modifiedAfter: Date,
    limit: number,
    after?: string
  ): Promise<RecordsResponseWithFlattenedAssociationsAndTotal> {
    // Get records
    // hubspot doesn't set hs_lastmodifieddate for some reason for contact
    const lastModifiedAtPropertyName = objectType === 'contact' ? 'lastmodifieddate' : 'hs_lastmodifieddate';
    const response = await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      return await axios.post<HubSpotAPIV3SearchResponse>(
        `${this.baseUrl}/crm/v3/objects/${objectType}/search`,
        {
          filterGroups: [
            {
              filters: [
                {
                  propertyName: lastModifiedAtPropertyName,
                  operator: 'GT', // TODO: should we do GTE in case there are multiple records updated at the same timestamp?
                  value: modifiedAfter.getTime().toString(),
                },
              ],
            },
          ],
          sorts: [
            {
              propertyName: lastModifiedAtPropertyName,
              direction: 'ASCENDING',
            },
          ],
          properties: propertiesToFetch,
          limit,
          after,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.#config.accessToken}`,
          },
        }
      );
    });

    const objectIds = response.data.results.map((result) => result.id);

    const ret: RecordsResponseWithFlattenedAssociationsAndTotal = response.data;

    // Get associations for standard objects
    for (const associatedStandardObjectType of associatedStandardObjectTypes) {
      const associationMap = await this.#listAssociations(objectType, associatedStandardObjectType, objectIds);

      // Add associations to results
      ret.results.forEach((result) => {
        if (!result.associations) {
          result.associations = {};
        }
        const validatedAssociatedStandardObjectType = toStandardObjectType(associatedStandardObjectType);
        // In the full fetcher, the associations use the plural object types, so we should do the same here
        result.associations[hubspotStandardObjectTypeToPlural[validatedAssociatedStandardObjectType]] =
          associationMap[result.id];
      });
    }

    // Get associations for custom objects
    for (const associatedCustomObjectSchema of associatedCustomObjectSchemas) {
      const associationMap = await this.#listAssociations(
        objectType,
        associatedCustomObjectSchema.objectTypeId,
        objectIds
      );

      // Add associations to results
      ret.results.forEach((result) => {
        if (!result.associations) {
          result.associations = {};
        }
        //
        result.associations[associatedCustomObjectSchema.objectTypeId] = associationMap[result.id];
      });
    }

    return ret;
  }

  public override async listCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date | undefined,
    heartbeat?: () => void
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'account':
        return this.listAccounts(fieldMappingConfig, updatedAfter);
      case 'contact':
        return this.listContacts(fieldMappingConfig, updatedAfter);
      case 'lead':
        return this.listLeads(fieldMappingConfig, updatedAfter);
      case 'opportunity':
        return this.listOpportunities(fieldMappingConfig, updatedAfter);
      case 'user':
        return this.listUsers(fieldMappingConfig);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async getCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    id: string,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    switch (commonObjectType) {
      case 'account':
        return this.getAccount(id, fieldMappingConfig);
      case 'contact':
        return this.getContact(id, fieldMappingConfig);
      case 'lead':
        throw new Error('Cannot get leads in HubSpot');
      case 'opportunity':
        return this.getOpportunity(id, fieldMappingConfig);
      case 'user':
        return this.getUser(id, fieldMappingConfig);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async createCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    switch (commonObjectType) {
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
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async updateCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<string> {
    switch (commonObjectType) {
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
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async listCommonProperties(object: CommonObjectDef): Promise<Property[]> {
    switch (object.name) {
      case 'account':
        return await this.listPropertiesForRawObjectName('company');
      case 'lead':
        throw new Error('common object "lead" is not supported for hubspot');
      case 'user':
        return hubspotUserProperties;
      default:
        return await this.listPropertiesForRawObjectName(object.name);
    }
  }

  public override async listProperties(object: StandardOrCustomObjectDef): Promise<Property[]> {
    return await this.listPropertiesForRawObjectName(object.name);
  }

  public async listPropertiesForRawObjectName(objectName: string): Promise<Property[]> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await this.#client.crm.properties.coreApi.getAll(objectName);
      return response.results.map(({ name, label }) => ({ id: name, label }));
    });
  }

  private async getCommonObjectPropertyIdsToFetch(
    objectType: HubSpotCommonObjectObjectType,
    fieldMappingConfig?: FieldMappingConfig
  ) {
    const availableProperties = await this.listPropertiesForRawObjectName(objectType);
    const availablePropertyIds = availableProperties.map(({ id }) => id);
    if (!fieldMappingConfig || fieldMappingConfig.type === 'inherit_all_fields') {
      return availablePropertyIds;
    }
    const properties = [...propertiesToFetch[objectType]];
    if (fieldMappingConfig?.type === 'defined') {
      properties.push(...fieldMappingConfig.fieldMappings.map((fieldMapping) => fieldMapping.mappedField));
    }
    return intersection(availablePropertyIds, properties);
  }

  public async listAccounts(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('company', fieldMappingConfig);
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
              record: {
                ...fromHubSpotCompanyToAccount(result),
                rawData: toMappedProperties(result.properties, fieldMappingConfig),
              },
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
              record: {
                ...fromHubSpotCompanyToAccount(result),
                rawData: toMappedProperties(result.properties, fieldMappingConfig),
              },
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

  public async getAccount(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Account> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('company');
    await this.maybeRefreshAccessToken();
    const company = await this.#client.crm.companies.basicApi.getById(id, properties);
    return {
      ...fromHubSpotCompanyToAccount(company),
      rawData: toMappedProperties(company.properties, fieldMappingConfig),
    };
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

  public async listOpportunities(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('deal', fieldMappingConfig);
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
              record: {
                ...fromHubSpotDealToOpportunity(deal, pipelineStageMapping),
                rawData: toMappedProperties(deal.properties, fieldMappingConfig),
              },
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
              record: {
                ...fromHubSpotDealToOpportunity(deal, pipelineStageMapping),
                rawData: toMappedProperties(deal.properties, fieldMappingConfig),
              },
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
      const dealToCompaniesMap = await this.#listAssociations('deal', 'company', dealIds);

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

  public async getOpportunity(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Opportunity> {
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const properties = await this.getCommonObjectPropertyIdsToFetch('deal');
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.getById(
      id,
      properties,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return {
      ...fromHubSpotDealToOpportunity(deal, pipelineStageMapping),
      rawData: toMappedProperties(deal.properties, fieldMappingConfig),
    };
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

  public async listContacts(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('contact', fieldMappingConfig);
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
            response.results.map((result) => ({
              record: {
                ...fromHubSpotContactToContact(result),
                rawData: toMappedProperties(result.properties, fieldMappingConfig),
              },
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
              record: {
                ...fromHubSpotContactToContact(result),
                rawData: toMappedProperties(result.properties, fieldMappingConfig),
              },
              emittedAt,
            }))
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

  public async getContact(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Contact> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('contact');
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.getById(
      id,
      properties,
      /* propertiesWithHistory */ undefined,
      /* associations */ ['company']
    );
    return {
      ...fromHubSpotContactToContact(contact),
      rawData: toMappedProperties(contact.properties, fieldMappingConfig),
    };
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

  public async listLeads(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
    return Readable.from([]);
  }

  public async createLead(params: LeadCreateParams): Promise<Lead> {
    throw new BadRequestError('Not supported');
  }

  public async updateLead(params: LeadUpdateParams): Promise<Lead> {
    throw new BadRequestError('Not supported');
  }

  public async getUser(id: string, fieldMappingConfig: FieldMappingConfig): Promise<User> {
    const owner = await this.#client.crm.owners.ownersApi.getById(parseInt(id));
    return { ...fromHubspotOwnerToUser(owner), rawData: toMappedProperties(owner, fieldMappingConfig) };
  }

  public async listUsers(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
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
              record: {
                ...fromHubspotOwnerToUser(result),
                rawData: toMappedProperties(fromHubspotOwnerToUser(result).rawData, fieldMappingConfig),
              },
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
              record: fromHubspotOwnerToUser(result),
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
    if (!fromObjectIds.length) {
      return {};
    }

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

  public override async getCustomObject(id: string): Promise<CustomObject> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.schemas.coreApi.getById(id);
    return {
      id: response.objectTypeId,
      name: response.name,
      description: null,
      primaryFieldKeyName: response.primaryDisplayProperty ?? '',
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

  public override async createCustomObject(params: CustomObjectCreateParams): Promise<string> {
    // TODO: Some of this general validation should be moved out of the provider-specific code
    if (!params.fields.length) {
      throw new Error('Cannot create custom object with no fields');
    }

    const primaryField = params.fields.find((field) => field.keyName === params.primaryFieldKeyName);

    if (!primaryField) {
      throw new BadRequestError(`Could not find primary field with key name ${params.primaryFieldKeyName}`);
    }

    if (primaryField.fieldType !== 'string') {
      throw new BadRequestError(
        `Primary field must be of type string, but was ${primaryField.fieldType} with key name ${params.primaryFieldKeyName}`
      );
    }

    if (!primaryField.isRequired) {
      throw new BadRequestError(
        `Primary field must be required, but was not with key name ${params.primaryFieldKeyName}`
      );
    }

    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.schemas.coreApi.create({
      name: params.name,
      labels: params.labels,
      primaryDisplayProperty: params.primaryFieldKeyName,
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

  public override async updateCustomObject(params: CustomObjectUpdateParams): Promise<void> {
    await this.maybeRefreshAccessToken();

    // Only update fields that have changed; for example, if you pass in the same
    // labels as the existing object, hubspot will throw an error.
    const existingObject = await this.getCustomObject(params.id);

    const labels =
      params.labels.singular === existingObject.labels.singular && params.labels.plural === existingObject.labels.plural
        ? undefined
        : params.labels;

    // Update the main object
    await this.#client.crm.schemas.coreApi.update(params.id, {
      // ignoring name because you can't update that in hubspot
      labels,
      requiredProperties: params.fields.filter((field) => field.isRequired).map((field) => field.keyName),
    });

    // Figure out which fields to create/update/delete
    const fieldNamesToDelete = existingObject.fields
      .map((field) => field.keyName)
      .filter((keyName) => {
        return !params.fields.map((field) => field.keyName).includes(keyName);
      });
    const fieldsToUpdate = params.fields.filter((field) => {
      const existingField = existingObject.fields.find((f) => f.keyName === field.keyName);
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
      (field) => !existingObject.fields.map((f) => f.keyName).includes(field.keyName)
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

  public override async getCustomObjectRecord(objectId: string, id: string): Promise<CustomObjectRecord> {
    await this.maybeRefreshAccessToken();

    // Get the properties to fetch
    // TODO: should we be returning other properties too?
    const customObject = await this.getCustomObject(objectId);
    const fieldsToFetch = customObject.fields.map((field) => field.keyName);
    const response = await this.#client.crm.objects.basicApi.getById(objectId, id, fieldsToFetch);

    return {
      id: response.id,
      objectId,
      fields: Object.fromEntries(Object.entries(response.properties).filter(([key]) => fieldsToFetch.includes(key))),
    };
  }

  public override async createCustomObjectRecord(params: CustomObjectRecordCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.objects.basicApi.create(params.objectId, {
      properties: params.fields as Record<string, string>, // TODO: map types?
    });
    return response.id;
  }

  public override async updateCustomObjectRecord(params: CustomObjectRecordUpdateParams): Promise<void> {
    await this.maybeRefreshAccessToken();
    await this.#client.crm.objects.basicApi.update(params.objectId, params.id, {
      properties: params.fields as Record<string, string>, // TODO: map types?
    });
  }

  public async getAssociationTypes(sourceObject: SGObject, targetObject: SGObject): Promise<AssociationType[]> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.associations.v4.definitionsApi.getAll(
      fromObjectToHubspotObjectType(sourceObject),
      fromObjectToHubspotObjectType(targetObject)
    );
    return response.results.map((result) => ({
      id: result.typeId.toString(),
      sourceObject,
      targetObject,
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
      fromObjectToHubspotObjectType(params.sourceObject),
      fromObjectToHubspotObjectType(params.targetObject),
      {
        label: params.displayName,
        name: params.keyName,
      }
    );
  }

  public async createAssociation(params: AssociationCreateParams): Promise<Association> {
    await this.maybeRefreshAccessToken();

    await this.#client.crm.associations.v4.batchApi.create(
      fromObjectToHubspotObjectType(params.sourceRecord.object),
      fromObjectToHubspotObjectType(params.targetRecord.object),
      {
        inputs: [
          {
            _from: { id: params.sourceRecord.id },
            to: { id: params.targetRecord.id },
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

  public override handleErr(err: unknown): unknown {
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

export function newClient(connection: ConnectionUnsafe<'hubspot'>, provider: Provider): HubSpotClient {
  return new HubSpotClient({
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    expiresAt: connection.credentials.expiresAt,
    clientId: (provider as CRMProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as CRMProvider).config.oauth.credentials.oauthClientSecret,
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

function filterForUpdatedAfterISOString<
  R extends {
    results: { updatedAt?: string }[];
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

      return updatedAfter.toISOString() < record.updatedAt;
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

function filterForArchivedAfterISOString<
  R extends {
    results: { archivedAt?: string }[];
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

      return archivedAfter.toISOString() < record.archivedAt;
    }),
  };
}

function normalizeResponse(
  response: RecordsResponseWithFlattenedAssociations
): NormalizedRecordsResponseWithFlattenedAssociations {
  return {
    results: response.results.map((result) => ({
      id: result.id,
      rawData: result,
      isDeleted: result.archived,
      lastModifiedAt: result.archivedAt ? new Date(result.archivedAt) : new Date(result.updatedAt),
      emittedAt: new Date(),
    })),
    paging: response.paging,
  };
}

// mapper
function toMappedRecords(
  records: NormalizedRawRecord<RecordWithFlattenedAssociations>[],
  fieldMappingConfig: FieldMappingConfig
): NormalizedRawRecord<RecordWithFlattenedAssociations>[] {
  if (fieldMappingConfig.type === 'inherit_all_fields') {
    return records;
  }

  return records.map((record) => ({
    ...record,
    rawData: {
      ...record.rawData,
      properties: toMappedProperties(record.rawData.properties, fieldMappingConfig),
    },
  }));
}

function toMappedProperties(
  properties: Record<string, any>,
  fieldMappingConfig: FieldMappingConfig
): Record<string, any> {
  if (fieldMappingConfig.type === 'inherit_all_fields') {
    return properties;
  }

  return Object.fromEntries(
    fieldMappingConfig.fieldMappings.map(({ schemaField, mappedField }) => [schemaField, properties[mappedField]])
  );
}
