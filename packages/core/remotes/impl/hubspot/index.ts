import { Client } from '@hubspot/api-client';
import type { BatchResponseLabelsBetweenObjectPairWithErrors } from '@hubspot/api-client/lib/codegen/crm/associations/v4/models/BatchResponseLabelsBetweenObjectPairWithErrors';
import type { FilterGroup } from '@hubspot/api-client/lib/codegen/crm/contacts';
import type {
  CollectionResponsePublicOwnerForwardPaging,
  CollectionResponsePublicOwnerForwardPaging as HubspotPaginatedOwners,
} from '@hubspot/api-client/lib/codegen/crm/owners';
import axios, { isAxiosError } from '@supaglue/core/remotes/sg_axios';
import type {
  ConnectionUnsafe,
  CreatePropertyParams,
  CRMProvider,
  ListedObjectRecord,
  ListedObjectRecordRawDataOnly,
  ObjectMetadata,
  ObjectRecordUpsertData,
  ObjectRecordWithMetadata,
  PaginationParams,
  Property,
  PropertyUnified,
  Provider,
  RemoteUserIdAndDetails,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
  StandardOrCustomObjectDef,
  UpdatePropertyParams,
} from '@supaglue/types';
import type { Association, AssociationCreateParams, ListAssociationsParams } from '@supaglue/types/association';
import type { AssociationSchema, SimpleAssociationSchema } from '@supaglue/types/association_schema';
import type {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  AccountUpsertParams,
  Contact,
  ContactCreateParams,
  ContactSearchParams,
  ContactUpdateParams,
  ContactUpsertParams,
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  CrmListParams,
  Lead,
  LeadCreateParams,
  LeadSearchParams,
  LeadUpdateParams,
  ListCRMCommonObject,
  ListCRMCommonObjectTypeMap,
  ListMetadata,
  Opportunity,
  OpportunityCreateParams,
  OpportunityUpdateParams,
  User,
} from '@supaglue/types/crm';
import type {
  CustomObjectSchema,
  CustomObjectSchemaCreateParams,
  CustomObjectSchemaUpdateParams,
  SimpleCustomObjectSchema,
  SimpleCustomObjectSchemaDeprecated,
} from '@supaglue/types/custom_object';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { FormField } from '@supaglue/types/marketing_automation/form_field';
import type { FormMetadata } from '@supaglue/types/marketing_automation/form_metadata';
import type { SubmitFormData, SubmitFormResult } from '@supaglue/types/marketing_automation/submit_form';
import type { StandardOrCustomObject } from '@supaglue/types/standard_or_custom_object';
import { HUBSPOT_STANDARD_OBJECT_TYPES } from '@supaglue/utils';
import retry from 'async-retry';
import { Readable } from 'stream';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  RemoteProviderError,
  SGConnectionNoLongerAuthenticatedError,
  SGError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../errors';
import type { PaginatedSupaglueRecords } from '../../../lib';
import {
  ASYNC_RETRY_OPTIONS,
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  encodeCursor,
  intersection,
  logger,
  REFRESH_TOKEN_THRESHOLD_MS,
  retryWhenAxiosRateLimited,
} from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';
import type { MarketingAutomationRemoteClient } from '../../categories/marketing_automation/base';
import { paginator } from '../../utils/paginator';
import { toMappedProperties } from '../../utils/properties';
import {
  fromHubSpotCompanyToAccount,
  fromHubSpotContactToContact,
  fromHubSpotDealToOpportunity,
  fromHubspotOwnerToUser,
  getHubspotOptions,
  toCustomObject,
  toHubspotAccountCreateParams,
  toHubspotAccountUpdateParams,
  toHubspotContactCreateParams,
  toHubspotContactUpdateParams,
  toHubspotCreatePropertyParams,
  toHubspotOpportunityCreateParams,
  toHubspotOpportunityUpdateParams,
  toHubspotTypeAndFieldType,
  toHubspotUpdatePropertyParams,
  toPropertyUnified,
} from './mappers';

export const HUBSPOT_INSTANCE_URL_PREFIX = 'https://app.hubspot.com/contacts/';

export const SUPAGLUE_ASSOCIATIONS_TIMESTAMP_PROPERTY_NAME = 'supaglue_associations_timestamp';

const HUBSPOT_RECORD_LIMIT = 100; // remote API limit
const HUBSPOT_SEARCH_RESULTS_LIMIT = 10000;

// 0-1 and 0-2 are the internal IDs in HubSpot for contact and company respectively
const HUBSPOT_LIST_OBJECT_TYPE_ID_MAP = {
  contact: '0-1',
  account: '0-2',
  opportunity: '0-3',
};

const COMMON_MODEL_TO_HUBSPOT_OBJECT_TYPE_MAP: Record<
  'contact' | 'account' | 'opportunity',
  HubSpotCommonObjectObjectType
> = {
  contact: 'contact',
  account: 'company',
  opportunity: 'deal',
};

const HUBSPOT_LIST_OBJECT_TYPES = Object.keys(HUBSPOT_LIST_OBJECT_TYPE_ID_MAP);

export const DEFAULT_PROPERTY_GROUP = 'custom_properties';

// TODO move this to lekko
// Fetching all associations is expensive and can exhaust rate limits quickly, so we only do it for
// a certain set of customers.
const FETCH_ASSOCIATIONS_APPLICATION_IDS = [
  '9773053e-a13f-4249-b641-301a51952708',
  'aba75b64-19ca-47c6-bb48-196911d8a18b',
  '82ff8465-2a09-499b-94c1-6d386502d14a',
  '8939a758-efa4-46e0-803f-370ae67ef5bf',
  '431cd6f6-0e99-4fb4-a4a7-df4a30a52ec7',
  '563d7da6-800d-4393-8023-06543520d855',
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

const hubspotStandardObjectPluralizedToType: Record<string, HubSpotStandardObjectType> = {
  companies: 'company',
  contacts: 'contact',
  deals: 'deal',
  'line items': 'line_item',
  products: 'product',
  tickets: 'ticket',
  quotes: 'quote',
  calls: 'call',
  communications: 'communication',
  emails: 'email',
  meetings: 'meeting',
  notes: 'note',
  'postal mails': 'postal_mail',
  tasks: 'task',
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

type HubSpotAPIV2ListFormsFormField = {
  name: string;
  label: string;
  required: boolean;
  fieldType: string;
  options?: {
    label: string;
    value: string;
  }[];
  validation: {
    message: string;
  };
};

type HubSpotAPIV2ListFormsFormFieldGroup = {
  fields: HubSpotAPIV2ListFormsFormField[];
};

type HubSpotAPIV2ListFormsSingleForm = {
  guid: string;
  name: string;
  createdAt: number; // ms since epoch
  updatedAt: number; // ms since epoch
  formFieldGroups: HubSpotAPIV2ListFormsFormFieldGroup[];
  [key: string]: unknown;
};

type HubSpotAPIV2ListFormsResponse = HubSpotAPIV2ListFormsSingleForm[];

type HubSpotAPIV3ListSchemasResponse = {
  results: HubSpotCustomSchema[];
};

type HubSpotAPIV3CreateRecordResponse = {
  id: string;
  properties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

type HubSpotAPIV3GetRecordResponse = {
  id: string;
  properties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
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

export type RecordWithFlattenedAssociations = {
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
  results: ListedObjectRecordRawDataOnly<RecordWithFlattenedAssociations>[];
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
  instanceUrl: string; // looks like this: `https://app.hubspot.com/contacts/${hubId.toString()}`;
  applicationId: string;
};

class HubSpotClient extends AbstractCrmRemoteClient implements MarketingAutomationRemoteClient {
  readonly #client: Client;
  readonly #config: HubspotClientConfig;

  public constructor(config: HubspotClientConfig) {
    super('https://api.hubapi.com');
    const { accessToken } = config;
    this.#client = new Client({
      accessToken,
      numberOfApiCallRetries: 2,
    });
    this.#config = config;
  }

  private getHubId(): number {
    const { instanceUrl } = this.#config;
    const hubId = instanceUrl.split('/').pop();
    if (!hubId) {
      throw new Error(`Could not determine hub id from instance url: ${instanceUrl}`);
    }
    return Number(hubId);
  }

  /**
   * This API is for the marketing automation cateogry only.
   */
  public async marketingAutomationSubmitForm(formId: string, formData: SubmitFormData): Promise<SubmitFormResult> {
    const portalId = this.getHubId();

    // Submit the form
    await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();

      return await axios.post(
        `https://api.hsforms.com/submissions/v3/integration/secure/submit/${portalId}/${formId}`,
        {
          fields: Object.entries(formData).map(([name, value]) => ({
            name,
            value,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${this.#config.accessToken}`,
          },
        }
      );
    });

    // TODO there's no way to get the created/updated prospect id from the form submit, it seems.
    //      There's also no way to tell if it was created or updated.
    return {
      status: 'created',
    };
  }

  /**
   * This API is for the marketing automation cateogry only.
   */
  public async marketingAutomationListForms(): Promise<FormMetadata[]> {
    const response = await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      return await axios.get<HubSpotAPIV2ListFormsResponse>(`${this.baseUrl}/forms/v2/forms`, {
        headers: {
          Authorization: `Bearer ${this.#config.accessToken}`,
        },
      });
    });

    return response.data.map((form) => ({
      id: form.guid,
      name: form.name,
      createdAt: new Date(form.createdAt),
      updatedAt: new Date(form.updatedAt),
      rawData: form,
    }));
  }

  /**
   * This API is for the marketing automation cateogry only.
   */
  public async marketingAutomationGetFormFields(formId: string): Promise<FormField[]> {
    const response = await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      return await axios.get<HubSpotAPIV2ListFormsSingleForm>(`${this.baseUrl}/forms/v2/forms/${formId}`, {
        headers: {
          Authorization: `Bearer ${this.#config.accessToken}`,
        },
      });
    });

    return response.data.formFieldGroups.flatMap((group) =>
      group.fields.map((field) => ({
        id: field.name,
        name: field.label,
        required: field.required,
        formId,
        dataFormat: field.fieldType,
        validationMessage: field.validation.message,
        dataOptions:
          field.fieldType === 'select'
            ? field.options?.map((option) => ({
                label: option.label,
                value: option.value,
              }))
            : undefined,
        rawData: field,
      }))
    );
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#config.accessToken}`,
    };
  }

  /**
   * @deprecated This doesn't return the V3 owner id and user id that Hubspot customers need.
   */
  public override async getUserIdAndDetails(): Promise<RemoteUserIdAndDetails> {
    await this.maybeRefreshAccessToken();
    const { accessToken } = this.#config;
    const response = await this.#client.oauth.accessTokensApi.get(accessToken);
    const { userId } = response;
    const { token: _, ...rawDetails } = response;
    return { userId: String(userId), rawDetails };
  }

  /**
   * This will replace getUserIdAndDetails() once we migrate all customers.
   * @todo: We'll then remove the need for the "x-sg-minor-version: 1" header.
   */
  public override async getUserIdAndDetails__v2_1(): Promise<RemoteUserIdAndDetails> {
    await this.maybeRefreshAccessToken();
    const { accessToken } = this.#config;
    const accessTokenResponse = await this.#client.oauth.accessTokensApi.get(accessToken);
    const { userId: authedUserId } = accessTokenResponse;
    const { token: _, ...authTokenRawDetails } = accessTokenResponse;

    let after = undefined;

    // paginate and find the owner by email: that is the only key to do the lookup
    // between v1's access token api and v3's owners api. v1 access token api is the
    // only way to lookup the active owner.
    do {
      const ownersResponse: CollectionResponsePublicOwnerForwardPaging =
        await this.#client.crm.owners.ownersApi.getPage(undefined, after);

      const foundOwner = ownersResponse.results.find((owner) => owner.userId === authedUserId);
      if (foundOwner) {
        return {
          userId: foundOwner.id,
          rawDetails: {
            ...authTokenRawDetails,
          },
          additionalRawDetails: {
            ...foundOwner,
          },
        };
      }

      if (ownersResponse.paging?.next?.after) {
        after = ownersResponse.paging?.next?.after;
      }
    } while (after !== undefined);

    // owner not found
    return { userId: undefined, rawDetails: undefined };
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (!this.#config.expiresAt || Date.parse(this.#config.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS) {
      try {
        const token = await this.#client.oauth.tokensApi.create(
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
      } catch (e: any) {
        if (e.response?.status === 400 || e.body?.status === 'BAD_REFRESH_TOKEN') {
          throw new SGConnectionNoLongerAuthenticatedError('Unable to refresh access token. Refresh token invalid.');
        }
        throw e;
      }
    }
  }

  private async getStandardPropertyIdsToFetch(objectType: string, fieldsToFetch: FieldsToFetch): Promise<string[]> {
    const availableProperties = await this.listPropertiesForRawObjectName(objectType);
    const availablePropertyIds = availableProperties.map(({ id }) => id);
    if (fieldsToFetch.type === 'inherit_all_fields') {
      return availablePropertyIds;
    }
    return intersection(availablePropertyIds, fieldsToFetch.fields);
  }

  public override async streamStandardObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date,
    heartbeat?: () => void,
    associationsToFetch?: string[]
  ): Promise<Readable> {
    const standardObjectType = toStandardObjectType(object);
    const propertiesToFetch = await this.getStandardPropertyIdsToFetch(object, fieldsToFetch);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged(object, associationsToFetch);

    const normalPageFetcher = await this.#getListRecordsFetcher(
      standardObjectType,
      propertiesToFetch,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ false,
      modifiedAfter
    );

    const archivedPageFetcher = await this.#getListRecordsFetcher(
      standardObjectType,
      propertiesToFetch,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ true,
      modifiedAfter
    );

    const normalFetcherAndHandler = {
      pageFetcher: normalPageFetcher,
      createStreamFromPage: (response: NormalizedRecordsResponseWithFlattenedAssociations) =>
        Readable.from(
          response.results.map((record) => {
            const ret: ListedObjectRecord = {
              ...record,
              rawProperties: record.rawData.properties,
            };
            return ret;
          })
        ),
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
        createStreamFromPage: (response) =>
          Readable.from(
            response.results.map((record) => {
              const ret: ListedObjectRecord = {
                ...record,
                rawProperties: record.rawData.properties,
              };
              return ret;
            })
          ),
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

  async #getAssociatedObjectTypesForObjectType(
    fromObjectTypeId: string,
    associationsToFetch: string[],
    fetchAll = false
  ): Promise<{
    standardObjectTypes: string[];
    customObjectSchemas: HubSpotCustomSchema[];
  }> {
    const standardAssociationsToFetch: Set<string> = fetchAll
      ? new Set(HUBSPOT_STANDARD_OBJECT_TYPES as unknown as string[])
      : new Set(
          associationsToFetch.filter((object) => {
            return (HUBSPOT_STANDARD_OBJECT_TYPES as unknown as string[]).includes(object);
          })
        );
    // Accept common model names too
    if (associationsToFetch.includes('account')) {
      standardAssociationsToFetch.add('company');
    }
    if (associationsToFetch.includes('opportunity')) {
      standardAssociationsToFetch.add('deal');
    }
    // By default, we need to fetch company for contact and deals
    if (fromObjectTypeId === 'contact' || fromObjectTypeId === 'deal') {
      standardAssociationsToFetch.add('company');
    }

    // For each standard object type, see if there is an association type
    const standardObjectTypes: string[] = [];
    for (const toObjectType of standardAssociationsToFetch) {
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

    if (!associationsToFetch.length && !fetchAll) {
      return { standardObjectTypes, customObjectSchemas: [] };
    }
    // For each custom object type, see if there is an association type
    const allCustomObjectSchemas = await this.#getAllCustomObjectSchemas();
    const customObjectSchemas: HubSpotCustomSchema[] = [];
    for (const customObjectSchema of allCustomObjectSchemas) {
      if (fromObjectTypeId === customObjectSchema.objectTypeId) {
        continue;
      }

      if (!fetchAll && !associationsToFetch.includes(customObjectSchema.name)) {
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

  async #getAssociatedObjectTypesForObjectTypeFeatureFlagged(
    fromObjectTypeId: string,
    associationsToFetch?: string[]
  ): Promise<{
    standardObjectTypes: string[];
    customObjectSchemas: HubSpotCustomSchema[];
  }> {
    const fetchAll = shouldFetchAllAssociations(this.#config.applicationId);
    if (fetchAll) {
      return await this.#getAssociatedObjectTypesForObjectType(
        fromObjectTypeId,
        [], // unused
        fetchAll
      );
    }
    if (associationsToFetch?.length) {
      return await this.#getAssociatedObjectTypesForObjectType(fromObjectTypeId, associationsToFetch, false);
    }
    return {
      standardObjectTypes: fromObjectTypeId === 'deal' || fromObjectTypeId === 'contact' ? ['company'] : [],
      customObjectSchemas: [],
    };
  }

  // TODO: implement fieldsToFetch for custom objects
  public override async streamCustomObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date,
    heartbeat?: () => void,
    associationsToFetch?: string[]
  ): Promise<Readable> {
    const objectTypeId = await this.#getObjectTypeIdFromNameOrId(object);
    const propertiesToFetch = await this.listPropertiesForRawObjectName(objectTypeId);
    const propertyIds = propertiesToFetch.map(({ id }) => id);

    // Find the associated object types for the object
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged(objectTypeId, associationsToFetch);

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
        createStreamFromPage: (response) =>
          Readable.from(
            response.results.map((result) => {
              const ret: ListedObjectRecord = {
                ...result,
                rawProperties: result.rawData.properties,
              };
              return ret;
            })
          ),
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
      {
        pageFetcher: archivedPageFetcher,
        createStreamFromPage: (response) =>
          Readable.from(
            response.results.map((result) => {
              const ret: ListedObjectRecord = {
                ...result,
                rawProperties: result.rawData.properties,
              };
              return ret;
            })
          ),
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
    after?: string,
    limit?: number
  ): Promise<RecordsResponseWithFlattenedAssociations> {
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const associations = [
        ...associatedStandardObjectTypes,
        ...associatedCustomObjectSchemas.map((s) => s.objectTypeId),
      ];
      const response = await axios.get<HubSpotAPIV3ListResponse>(`${this.baseUrl}/crm/v3/objects/${objectType}`, {
        params: {
          limit: limit ?? HUBSPOT_RECORD_LIMIT,
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
          associations: flattenAssociations(associations, associatedCustomObjectSchemas),
        })),
      };
    });
  }

  async #fetchPageOfSearchedRecords(
    objectType: string,
    propertiesToFetch: string[],
    associatedStandardObjectTypes: string[],
    associatedCustomObjectSchemas: HubSpotCustomSchema[],
    filterGroups: Array<FilterGroup>,
    sorts: {
      propertyName: string;
      direction: string;
    }[],
    limit: number,
    after?: string
  ): Promise<RecordsResponseWithFlattenedAssociationsAndTotal> {
    const response = await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      return await axios.post<HubSpotAPIV3SearchResponse>(
        `${this.baseUrl}/crm/v3/objects/${objectType}/search`,
        {
          filterGroups,
          sorts,
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
        result.associations[validatedAssociatedStandardObjectType] = associationMap[result.id];
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

  async #fetchPageOfIncrementalRecords(
    objectType: string,
    propertiesToFetch: string[],
    associatedStandardObjectTypes: string[],
    associatedCustomObjectSchemas: HubSpotCustomSchema[],
    modifiedAfter: Date,
    limit: number,
    after?: string
  ): Promise<RecordsResponseWithFlattenedAssociationsAndTotal> {
    const lastModifiedAtPropertyName = objectType === 'contact' ? 'lastmodifieddate' : 'hs_lastmodifieddate';
    return await this.#fetchPageOfSearchedRecords(
      objectType,
      propertiesToFetch,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      [
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
      [
        {
          propertyName: lastModifiedAtPropertyName,
          direction: 'ASCENDING',
        },
      ],
      limit,
      after
    );
  }

  public override async streamCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date | undefined,
    heartbeat?: () => void,
    associationsToFetch?: string[]
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'account':
        return this.streamAccounts(fieldMappingConfig, updatedAfter, associationsToFetch);
      case 'contact':
        return this.streamContacts(fieldMappingConfig, updatedAfter, associationsToFetch);
      case 'lead':
        return this.streamLeads(fieldMappingConfig, updatedAfter, associationsToFetch);
      case 'opportunity':
        return this.streamOpportunities(fieldMappingConfig, updatedAfter, associationsToFetch);
      case 'user':
        return this.streamUsers(fieldMappingConfig);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async getCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    id: string,
    fieldMappingConfig: FieldMappingConfig,
    associationsToFetch?: string[]
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    switch (commonObjectType) {
      case 'account':
        return this.getAccount(id, fieldMappingConfig, associationsToFetch);
      case 'contact':
        return this.getContact(id, fieldMappingConfig, associationsToFetch);
      case 'lead':
        throw new Error('Cannot get leads in HubSpot');
      case 'opportunity':
        return this.getOpportunity(id, fieldMappingConfig, associationsToFetch);
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

  public override async upsertCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['upsertParams']
  ): Promise<string> {
    switch (commonObjectType) {
      case 'account':
        return this.upsertAccount(params as AccountUpsertParams);
      case 'contact':
        return this.upsertContact(params as ContactUpsertParams);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async searchCommonObjectRecords<T extends 'account' | 'contact' | 'lead' | 'opportunity' | 'user'>(
    commonObjectType: T,
    fieldMappingConfig: FieldMappingConfig,
    params: CRMCommonObjectTypeMap<T>['searchParams']
  ): Promise<PaginatedSupaglueRecords<CRMCommonObjectTypeMap<T>['object']>> {
    switch (commonObjectType) {
      case 'contact':
        return this.searchContact(params as ContactSearchParams, fieldMappingConfig);
      case 'lead':
        return this.searchLead(params as LeadSearchParams, fieldMappingConfig);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async listCommonObjectRecords<T extends 'account' | 'contact' | 'lead' | 'opportunity' | 'user'>(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    params: CRMCommonObjectTypeMap<T>['listParams']
  ): Promise<PaginatedSupaglueRecords<CRMCommonObjectTypeMap<T>['object']>> {
    switch (commonObjectType) {
      case 'contact':
        return await this.listContacts(params, fieldMappingConfig);
      case 'lead':
        return await this.listLeads(params, fieldMappingConfig);
      case 'account':
        return await this.listAccounts(params, fieldMappingConfig);
      case 'opportunity':
        return await this.listOpportunities(params, fieldMappingConfig);
      case 'user':
        return await this.listUsers(params, fieldMappingConfig);
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

  public override async getObjectRecord(
    object: StandardOrCustomObject,
    id: string,
    fields: string[]
  ): Promise<ObjectRecordWithMetadata> {
    let objectType = object.name;
    if (object.type === 'custom') {
      objectType = await this.#getObjectTypeIdFromNameOrId(object.name);
    }

    const response = await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      return await axios.get<HubSpotAPIV3GetRecordResponse>(`${this.baseUrl}/crm/v3/objects/${objectType}/${id}`, {
        headers: {
          Authorization: `Bearer ${this.#config.accessToken}`,
        },
        params: {
          properties: fields.join(','),
        },
      });
    });

    return {
      id: response.data.id,
      objectName: object.name,
      data: response.data,
      metadata: getMetadataFromRecord(response.data),
    };
  }

  public override async createObjectRecord(
    object: StandardOrCustomObject,
    data: ObjectRecordUpsertData
  ): Promise<string> {
    let objectType = object.name;
    if (object.type === 'custom') {
      objectType = await this.#getObjectTypeIdFromNameOrId(object.name);
    }

    const response = await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      return await axios.post<HubSpotAPIV3CreateRecordResponse>(
        `${this.baseUrl}/crm/v3/objects/${objectType}`,
        {
          properties: data,
        },
        {
          headers: {
            Authorization: `Bearer ${this.#config.accessToken}`,
          },
        }
      );
    });

    return response.data.id;
  }

  public override async updateObjectRecord(
    object: StandardOrCustomObject,
    id: string,
    data: ObjectRecordUpsertData
  ): Promise<void> {
    let objectType = object.name;
    if (object.type === 'custom') {
      objectType = await this.#getObjectTypeIdFromNameOrId(object.name);
    }

    await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      return await axios.patch<HubSpotAPIV3CreateRecordResponse>(
        `${this.baseUrl}/crm/v3/objects/${objectType}/${id}`,
        {
          properties: data,
        },
        {
          headers: {
            Authorization: `Bearer ${this.#config.accessToken}`,
          },
        }
      );
    });
  }

  public override async listProperties(object: StandardOrCustomObjectDef): Promise<Property[]> {
    return await this.listPropertiesForRawObjectName(object.name);
  }

  public override async listPropertiesUnified(objectName: string): Promise<PropertyUnified[]> {
    const objectSchema = await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const objectTypeId = await this.#getObjectTypeIdFromNameOrId(objectName);
      return await this.#client.crm.schemas.coreApi.getById(objectTypeId);
    });
    return objectSchema.properties.map((property) =>
      toPropertyUnified(property, new Set(objectSchema.requiredProperties))
    );
  }

  public override async getProperty(objectName: string, propertyName: string): Promise<PropertyUnified> {
    const objectSchema = await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const objectTypeId = await this.#getObjectTypeIdFromNameOrId(objectName);
      return await this.#client.crm.schemas.coreApi.getById(objectTypeId);
    });
    const found = objectSchema.properties.find((property) => property.name === propertyName);
    if (!found) {
      throw new NotFoundError(`Property ${propertyName} not found on object ${objectName}`);
    }
    return toPropertyUnified(found, new Set(objectSchema.requiredProperties));
  }

  public override async createProperty(objectName: string, params: CreatePropertyParams): Promise<PropertyUnified> {
    if (objectName === 'user') {
      throw new BadRequestError('Cannot create properties on the user object');
    }
    const groupName = params.groupName ?? DEFAULT_PROPERTY_GROUP;
    const objectTypeId = await this.#getObjectTypeIdFromNameOrId(objectName);
    await this.#upsertPropertyGroup(objectTypeId, groupName);
    const created = await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      return await this.#client.crm.properties.coreApi.create(objectTypeId, toHubspotCreatePropertyParams(params));
    });
    return toPropertyUnified(created, new Set(params.isRequired ? [params.name] : []));
  }

  public override async updateProperty(
    objectName: string,
    propertyName: string,
    params: UpdatePropertyParams
  ): Promise<PropertyUnified> {
    if (objectName === 'user') {
      throw new BadRequestError('Cannot create properties on the user object');
    }
    const objectTypeId = await this.#getObjectTypeIdFromNameOrId(objectName);
    if (params.groupName) {
      await this.#upsertPropertyGroup(objectTypeId, params.groupName);
    }

    // get the type of the existing property since it's required for some updates
    const { type: existingType } = await this.getProperty(objectName, propertyName);

    if (!params.type) {
      params.type = existingType;
    }
    await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      return await this.#client.crm.properties.coreApi.update(
        objectTypeId,
        propertyName,
        toHubspotUpdatePropertyParams(params)
      );
    });
    return await this.getProperty(objectName, propertyName);
  }

  async #upsertPropertyGroup(objectTypeId: string, groupName: string) {
    await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      try {
        await this.#client.crm.properties.groupsApi.create(objectTypeId, {
          name: groupName,
          label: groupName,
        });
      } catch (e: any) {
        if (e.code === 409) {
          // group already exists, so we're good
          return;
        }
        throw e;
      }
    });
  }

  public async listPropertiesForRawObjectName(objectName: string): Promise<Property[]> {
    return await retryWhenRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await this.#client.crm.properties.coreApi.getAll(objectName);
      return response.results.map((prop) => ({
        id: prop.name,
        label: prop.label,
        type: prop.type,
        rawDetails: prop as unknown as Record<string, unknown>,
      }));
    });
  }

  private async getCommonObjectPropertyIdsToFetch(
    objectType: HubSpotCommonObjectObjectType,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<string[]> {
    const availableProperties = await this.listPropertiesForRawObjectName(objectType);
    const availablePropertyIds = availableProperties.map(({ id }) => id);
    if (fieldMappingConfig.type === 'inherit_all_fields') {
      return availablePropertyIds;
    }
    const properties = [...propertiesToFetch[objectType]];
    if (fieldMappingConfig?.type === 'defined') {
      properties.push(...fieldMappingConfig.coreFieldMappings.map((fieldMapping) => fieldMapping.mappedField));
      properties.push(...fieldMappingConfig.additionalFieldMappings.map((fieldMapping) => fieldMapping.mappedField));
    }
    return intersection(availablePropertyIds, properties);
  }

  public async streamAccounts(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    associationsToFetch?: string[]
  ): Promise<Readable> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('company', fieldMappingConfig);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('company', associationsToFetch);
    const normalPageFetcher = await this.#getListRecordsFetcher(
      'company',
      properties,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ false,
      updatedAfter
    );

    const archivedPageFetcher = await this.#getListRecordsFetcher(
      'company',
      properties,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ true,
      updatedAfter
    );

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((result) => ({
              record: {
                ...fromHubSpotCompanyToAccount(result.rawData),
                rawData: {
                  ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
                  _associations: result.rawData.associations,
                },
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
                ...fromHubSpotCompanyToAccount(result.rawData),
                rawData: {
                  ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
                  _associations: result.rawData.associations,
                },
              },
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  public async listAccounts(
    params: CrmListParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<Account>> {
    await this.maybeRefreshAccessToken();
    const properties = await this.getCommonObjectPropertyIdsToFetch('company', fieldMappingConfig);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('company', params.associationsToFetch);
    const response = params.modifiedAfter
      ? await this.#fetchPageOfIncrementalRecords(
          'company',
          properties,
          associatedStandardObjectTypes,
          associatedCustomObjectSchemas,
          params.modifiedAfter,
          params.pageSize ?? DEFAULT_PAGE_SIZE,
          decodeCursor(params.cursor)?.id as string | undefined
        )
      : await this.#fetchPageOfFullRecords(
          'company',
          properties,
          associatedStandardObjectTypes,
          associatedCustomObjectSchemas,
          /* archived */ false,
          decodeCursor(params.cursor)?.id as string | undefined,
          params.pageSize
        );
    const normalized = normalizeResponse(response);

    const records = normalized.results.map((result) => {
      return {
        ...fromHubSpotCompanyToAccount(result.rawData),
        rawData: {
          ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
          _associations: result.rawData.associations,
        },
      };
    });
    return {
      pagination: {
        previous: null,
        next: response.paging?.next?.after ? encodeCursor({ id: response.paging.next.after, reverse: false }) : null,
        total_count: (response as RecordsResponseWithFlattenedAssociationsAndTotal).total,
      },
      records,
    };
  }

  public async getAccount(
    id: string,
    fieldMappingConfig: FieldMappingConfig,
    associationsToFetch?: string[]
  ): Promise<Account> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('company', fieldMappingConfig);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('company', associationsToFetch);
    const associations = [
      ...associatedStandardObjectTypes,
      ...associatedCustomObjectSchemas.map((s) => s.objectTypeId),
    ];
    const company = await this.#client.crm.companies.basicApi.getById(
      id,
      properties,
      /* propertiesWithHistory */ undefined,
      associations.length ? associations : undefined
    );
    const flattenedAssociations = flattenAssociations(company.associations, associatedCustomObjectSchemas);
    return {
      ...fromHubSpotCompanyToAccount({
        ...company,
        associations: flattenedAssociations,
      } as unknown as RecordWithFlattenedAssociations),
      rawData: { ...toMappedProperties(company.properties, fieldMappingConfig), _associations: flattenedAssociations },
    };
  }

  public async createAccount(params: AccountCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.companies.basicApi.create({
      properties: toHubspotAccountCreateParams(params),
      associations: [],
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

  public async upsertAccount(params: AccountUpsertParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const searchResponse = await this.#client.crm.companies.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              values: params.upsertOn.values,
              propertyName: params.upsertOn.key,
              operator: 'IN',
            },
          ],
        },
      ],
      sorts: [params.upsertOn.key],
      properties: ['id', params.upsertOn.key],
      limit: 2,
      after: 0,
    });

    if (searchResponse.results.length > 1) {
      throw new BadRequestError('More than one account found for upsert query');
    }
    if (searchResponse.results.length === 0) {
      return this.createAccount(params.record);
    }
    const existingAccountId = searchResponse.results[0].id;
    return this.updateAccount({ ...params.record, id: existingAccountId });
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

  public async streamOpportunities(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    associationsToFetch?: string[]
  ): Promise<Readable> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('deal', fieldMappingConfig);
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('deal', associationsToFetch);
    const normalPageFetcher = await this.#getListRecordsFetcher(
      'deal',
      properties,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ false,
      updatedAfter
    );

    const archivedPageFetcher = await this.#getListRecordsFetcher(
      'deal',
      properties,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ true,
      updatedAfter
    );

    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((result) => ({
              record: {
                ...fromHubSpotDealToOpportunity(result.rawData, pipelineStageMapping),
                rawData: {
                  ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
                  _associations: result.rawData.associations,
                },
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
                ...fromHubSpotDealToOpportunity(result.rawData, pipelineStageMapping),
                rawData: {
                  ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
                  _associations: result.rawData.associations,
                },
              },
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  public async listOpportunities(
    params: CrmListParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<Opportunity>> {
    await this.maybeRefreshAccessToken();
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const properties = await this.getCommonObjectPropertyIdsToFetch('deal', fieldMappingConfig);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('deal', params.associationsToFetch);
    const response = params.modifiedAfter
      ? await this.#fetchPageOfIncrementalRecords(
          'deal',
          properties,
          associatedStandardObjectTypes,
          associatedCustomObjectSchemas,
          params.modifiedAfter,
          params.pageSize ?? DEFAULT_PAGE_SIZE,
          decodeCursor(params.cursor)?.id as string | undefined
        )
      : await this.#fetchPageOfFullRecords(
          'deal',
          properties,
          associatedStandardObjectTypes,
          associatedCustomObjectSchemas,
          /* archived */ false,
          decodeCursor(params.cursor)?.id as string | undefined,
          params.pageSize
        );
    const normalized = normalizeResponse(response);

    const records = normalized.results.map((result) => {
      return {
        ...fromHubSpotDealToOpportunity(result.rawData, pipelineStageMapping),
        rawData: {
          ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
          _associations: result.rawData.associations,
        },
      };
    });
    return {
      pagination: {
        previous: null,
        next: response.paging?.next?.after ? encodeCursor({ id: response.paging.next.after, reverse: false }) : null,
        total_count: (response as RecordsResponseWithFlattenedAssociationsAndTotal).total ?? -1,
      },
      records,
    };
  }

  public async getOpportunity(
    id: string,
    fieldMappingConfig: FieldMappingConfig,
    associationsToFetch?: string[]
  ): Promise<Opportunity> {
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const properties = await this.getCommonObjectPropertyIdsToFetch('deal', fieldMappingConfig);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('deal', associationsToFetch);
    const associations = [
      ...associatedStandardObjectTypes,
      ...associatedCustomObjectSchemas.map((s) => s.objectTypeId),
    ];
    const deal = await this.#client.crm.deals.basicApi.getById(
      id,
      properties,
      /* propertiesWithHistory */ undefined,
      associations.length ? associations : undefined
    );
    const flattenedAssociations = flattenAssociations(deal.associations, associatedCustomObjectSchemas);
    return {
      ...fromHubSpotDealToOpportunity(
        {
          ...deal,
          associations: flattenAssociations(deal.associations, associatedCustomObjectSchemas),
        } as unknown as RecordWithFlattenedAssociations,
        pipelineStageMapping
      ),
      rawData: { ...toMappedProperties(deal.properties, fieldMappingConfig), _associations: flattenedAssociations },
    };
  }

  public async createOpportunity(params: OpportunityCreateParams): Promise<string> {
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    await this.maybeRefreshAccessToken();
    const deal = await this.#client.crm.deals.basicApi.create({
      properties: toHubspotOpportunityCreateParams(params, pipelineStageMapping),
      associations: params.accountId
        ? [
            {
              to: {
                id: params.accountId,
              },
              types: [
                {
                  associationCategory: 'HUBSPOT_DEFINED',
                  associationTypeId: OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID,
                },
              ],
            },
          ]
        : [],
    });
    return deal.id;
  }

  public async updateOpportunity(params: OpportunityUpdateParams): Promise<string> {
    let { id } = params;
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    await this.maybeRefreshAccessToken();
    const propertiesToUpdate = toHubspotOpportunityUpdateParams(params, pipelineStageMapping);
    if (Object.keys(propertiesToUpdate).length) {
      const deal = await this.#client.crm.deals.basicApi.update(params.id, {
        properties: propertiesToUpdate,
      });
      ({ id } = deal);
    }
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.associations.v4.basicApi.create(
        'deal',
        parseInt(id),
        'company',
        parseInt(params.accountId),
        [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: OPPORTUNITY_TO_PRIMARY_COMPANY_ASSOCIATION_ID }]
      );
    }
    return id;
  }

  public async streamContacts(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    associationsToFetch?: string[]
  ): Promise<Readable> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('contact', fieldMappingConfig);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('contact', associationsToFetch);
    const normalPageFetcher = await this.#getListRecordsFetcher(
      'contact',
      properties,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ false,
      updatedAfter
    );

    const archivedPageFetcher = await this.#getListRecordsFetcher(
      'contact',
      properties,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      /* archived */ true,
      updatedAfter
    );
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.results.map((result) => ({
              record: {
                ...fromHubSpotContactToContact(result.rawData),
                rawData: {
                  ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
                  _associations: result.rawData.associations,
                },
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
                ...fromHubSpotContactToContact(result.rawData),
                rawData: {
                  ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
                  _associations: result.rawData.associations,
                },
              },
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.paging?.next?.after,
      },
    ]);
  }

  public async getContact(
    id: string,
    fieldMappingConfig: FieldMappingConfig,
    associationsToFetch?: string[]
  ): Promise<Contact> {
    const properties = await this.getCommonObjectPropertyIdsToFetch('contact', fieldMappingConfig);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('contact', associationsToFetch);

    const associations = [
      ...associatedStandardObjectTypes,
      ...associatedCustomObjectSchemas.map((s) => s.objectTypeId),
    ];
    const contact = await this.#client.crm.contacts.basicApi.getById(
      id,
      properties,
      /* propertiesWithHistory */ undefined,
      associations.length ? associations : undefined
    );
    const flattenedAssociations = flattenAssociations(contact.associations, associatedCustomObjectSchemas);
    return {
      ...fromHubSpotContactToContact({
        ...contact,
        associations: flattenedAssociations,
      } as unknown as RecordWithFlattenedAssociations),
      rawData: { ...toMappedProperties(contact.properties, fieldMappingConfig), _associations: flattenedAssociations },
    };
  }

  public async createContact(params: ContactCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const contact = await this.#client.crm.contacts.basicApi.create({
      properties: toHubspotContactCreateParams(params),
      associations: params.accountId
        ? [
            {
              to: {
                id: params.accountId,
              },
              types: [
                {
                  associationCategory: 'HUBSPOT_DEFINED',
                  associationTypeId: CONTACT_TO_PRIMARY_COMPANY_ASSOCIATION_ID,
                },
              ],
            },
          ]
        : [],
    });
    return contact.id;
  }

  public async listContacts(
    params: CrmListParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<Contact>> {
    await this.maybeRefreshAccessToken();
    const properties = await this.getCommonObjectPropertyIdsToFetch('contact', fieldMappingConfig);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('contact', params.associationsToFetch);
    const response = params.modifiedAfter
      ? await this.#fetchPageOfIncrementalRecords(
          'contact',
          properties,
          associatedStandardObjectTypes,
          associatedCustomObjectSchemas,
          params.modifiedAfter,
          params.pageSize ?? DEFAULT_PAGE_SIZE,
          decodeCursor(params.cursor)?.id as string | undefined
        )
      : await this.#fetchPageOfFullRecords(
          'contact',
          properties,
          associatedStandardObjectTypes,
          associatedCustomObjectSchemas,
          /* archived */ false,
          decodeCursor(params.cursor)?.id as string | undefined,
          params.pageSize
        );
    const normalized = normalizeResponse(response);

    const records = normalized.results.map((result) => {
      return {
        ...fromHubSpotContactToContact(result.rawData),
        rawData: {
          ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
          _associations: result.rawData.associations,
        },
      };
    });
    return {
      pagination: {
        previous: null,
        next: response.paging?.next?.after ? encodeCursor({ id: response.paging.next.after, reverse: false }) : null,
        total_count: (response as RecordsResponseWithFlattenedAssociationsAndTotal).total ?? -1,
      },
      records,
    };
  }

  public async searchContact(
    params: ContactSearchParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<Contact>> {
    await this.maybeRefreshAccessToken();
    const properties = await this.getCommonObjectPropertyIdsToFetch('contact', fieldMappingConfig);
    const { standardObjectTypes: associatedStandardObjectTypes, customObjectSchemas: associatedCustomObjectSchemas } =
      await this.#getAssociatedObjectTypesForObjectTypeFeatureFlagged('contact');
    const response = await this.#fetchPageOfSearchedRecords(
      'contact',
      properties,
      associatedStandardObjectTypes,
      associatedCustomObjectSchemas,
      [
        {
          filters: [
            {
              value: params.filter.email,
              propertyName: 'email',
              operator: 'EQ',
            },
          ],
        },
      ],
      [{ propertyName: 'email', direction: 'ASCENDING' }],
      params.pageSize ?? DEFAULT_PAGE_SIZE
      // We ignore cursor for now
      // TODO: Implement search cursor
    );
    const normalized = normalizeResponse(response);
    const records = normalized.results.map((result) => {
      return {
        ...fromHubSpotContactToContact(result.rawData),
        rawData: {
          ...toMappedProperties(result.rawData.properties, fieldMappingConfig),
          _associations: result.rawData.associations,
        },
      };
    });
    return {
      pagination: {
        // TODO: We assume there's only 1 record anyway. But eventually we should implement this.
        previous: null,
        next: null,
        total_count: response.total,
      },
      records,
    };
  }

  public async upsertContact(params: ContactUpsertParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const searchResponse = await this.#client.crm.contacts.searchApi.doSearch({
      filterGroups: [
        {
          filters: [
            {
              values: params.upsertOn.values,
              propertyName: params.upsertOn.key,
              operator: 'IN',
            },
          ],
        },
      ],
      sorts: [params.upsertOn.key],
      properties: ['id', params.upsertOn.key],
      limit: 2,
      after: 0,
    });
    if (searchResponse.results.length > 1) {
      throw new BadRequestError('More than one contact found for upsert query');
    }
    if (searchResponse.results.length === 0) {
      return this.createContact(params.record);
    }
    const existingContactId = searchResponse.results[0].id;
    return this.updateContact({ ...params.record, id: existingContactId });
  }

  public async updateContact(params: ContactUpdateParams): Promise<string> {
    let { id } = params;
    await this.maybeRefreshAccessToken();
    const propertiesToUpdate = toHubspotContactUpdateParams(params);
    if (Object.keys(propertiesToUpdate).length) {
      const contact = await this.#client.crm.contacts.basicApi.update(params.id, {
        properties: toHubspotContactUpdateParams(params),
      });
      ({ id } = contact);
    }
    if (params.accountId && parseInt(params.accountId)) {
      await this.#client.crm.associations.v4.basicApi.create(
        'contact',
        parseInt(id),
        'company',
        parseInt(params.accountId),
        [{ associationCategory: 'HUBSPOT_DEFINED', associationTypeId: CONTACT_TO_PRIMARY_COMPANY_ASSOCIATION_ID }]
      );
    }
    return id;
  }

  public async listLeads(
    params: CrmListParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<Lead>> {
    throw new BadRequestError('Listing leads is not supported for hubspot');
  }

  public async streamLeads(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    associationsToFetch?: string[]
  ): Promise<Readable> {
    return Readable.from([]);
  }

  public async createLead(params: LeadCreateParams): Promise<Lead> {
    throw new BadRequestError('Not supported');
  }

  public async searchLead(
    params: LeadSearchParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<Lead>> {
    throw new BadRequestError('Not supported');
  }

  public async updateLead(params: LeadUpdateParams): Promise<Lead> {
    throw new BadRequestError('Not supported');
  }

  public async getUser(id: string, fieldMappingConfig: FieldMappingConfig): Promise<User> {
    const owner = await this.#client.crm.owners.ownersApi.getById(parseInt(id));
    return { ...fromHubspotOwnerToUser(owner), rawData: toMappedProperties(owner, fieldMappingConfig) };
  }

  public async listUsers(
    params: CrmListParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<User>> {
    let response = await this.#listUsersFull(
      /* archived */ false,
      decodeCursor(params.cursor)?.id as string | undefined
    );
    if (params.modifiedAfter) {
      response = filterForUpdatedAfter(response, params.modifiedAfter);
    }

    const records = response.results.map((result) => {
      return {
        ...fromHubspotOwnerToUser(result),
        rawData: toMappedProperties(fromHubspotOwnerToUser(result).rawData, fieldMappingConfig),
      };
    });
    return {
      pagination: {
        previous: null,
        next: response.paging?.next?.after ? encodeCursor({ id: response.paging.next.after, reverse: false }) : null,
      },
      records,
    };
  }

  public async streamUsers(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
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

  public override async listAssociations(params: ListAssociationsParams): Promise<Association[]> {
    await this.maybeRefreshAccessToken();
    const fromObjectType = params.sourceRecord.objectName;
    const toObjectType = params.targetObject;
    // TODO: need to page through all associations
    const associations = await this.#client.crm.associations.v4.basicApi.getPage(
      fromObjectType,
      parseInt(params.sourceRecord.id),
      toObjectType
    );
    return associations.results.flatMap((result) =>
      result.associationTypes.map((associationSchema) => ({
        associationSchemaId: associationSchema.typeId.toString(),
        sourceRecord: params.sourceRecord,
        targetRecord: {
          id: result.toObjectId.toString(),
          objectName: params.targetObject,
        },
      }))
    );
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
        .map((result) => ({ [result._from.id]: [...new Set(result.to.map(({ id }) => id))] }))
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});
    });
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }

  public override async listStandardObjectSchemas(): Promise<string[]> {
    return HUBSPOT_STANDARD_OBJECT_TYPES as unknown as string[];
  }

  /**
   * @deprecated
   */
  public override async listCustomObjectSchemasDeprecated(): Promise<SimpleCustomObjectSchemaDeprecated[]> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.schemas.coreApi.getAll();
    return response.results.map((object) => ({ id: object.id, name: object.name }));
  }

  public override async listCustomObjectSchemas(): Promise<SimpleCustomObjectSchema[]> {
    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.schemas.coreApi.getAll();
    return response.results.map((object) => ({
      name: object.name,
      labels: {
        singular: object.labels.singular ?? '',
        plural: object.labels.plural ?? '',
      },
    }));
  }

  #isAlreadyObjectTypeId(nameOrId: string): boolean {
    const pattern = /^\d+-\d+$/;
    return pattern.test(nameOrId);
  }

  // In certain cases, Hubspot cannot determine the object type based on just the name for custom objects,
  // so we need to get the ID.
  async #getObjectTypeIdFromNameOrId(nameOrId: string): Promise<string> {
    // Standard objects can be referred by name no problem
    if (isStandardObjectType(nameOrId)) {
      return nameOrId;
    }
    if (this.#isAlreadyObjectTypeId(nameOrId)) {
      return nameOrId;
    }
    await this.maybeRefreshAccessToken();
    const schemas = await this.#client.crm.schemas.coreApi.getAll();
    const schemaId = schemas.results.find((schema) => schema.name === nameOrId || schema.objectTypeId === nameOrId)
      ?.objectTypeId;
    if (!schemaId) {
      throw new NotFoundError(`Could not find custom object schema with name or id ${nameOrId}`);
    }
    return schemaId;
  }

  public override async getCustomObjectSchema(name: string): Promise<CustomObjectSchema> {
    await this.maybeRefreshAccessToken();
    const schemaId = await this.#getObjectTypeIdFromNameOrId(name);
    const response = await this.#client.crm.schemas.coreApi.getById(schemaId);
    return toCustomObject(response);
  }

  public override async createCustomObjectSchema(params: CustomObjectSchemaCreateParams): Promise<string> {
    // TODO: Some of this general validation should be moved out of the provider-specific code
    if (!params.fields.length) {
      throw new Error('Cannot create custom object with no fields');
    }

    const primaryField = params.fields.find((field) => field.id === params.primaryFieldId);

    if (!primaryField) {
      throw new BadRequestError(`Could not find primary field with key name ${params.primaryFieldId}`);
    }

    if (primaryField.type !== 'text') {
      throw new BadRequestError(
        `Primary field must be of type text, but was ${primaryField.type} with key name ${params.primaryFieldId}`
      );
    }

    if (!primaryField.isRequired) {
      throw new BadRequestError(`Primary field must be required, but was not with key name ${params.primaryFieldId}`);
    }

    await this.maybeRefreshAccessToken();
    const response = await this.#client.crm.schemas.coreApi.create({
      name: params.name,
      labels: params.labels,
      primaryDisplayProperty: params.primaryFieldId,
      properties: params.fields.map((field) => ({
        name: field.id,
        label: field.label,
        options: getHubspotOptions(field),
        ...toHubspotTypeAndFieldType(field.type),
      })),
      requiredProperties: params.fields.filter((field) => field.isRequired).map((field) => field.id),
      searchableProperties: [],
      secondaryDisplayProperties: [],
      associatedObjects: [],
    });
    return response.name;
  }

  public override async updateCustomObjectSchema(params: CustomObjectSchemaUpdateParams): Promise<void> {
    await this.maybeRefreshAccessToken();

    // Only update fields that have changed; for example, if you pass in the same
    // labels as the existing object, hubspot will throw an error.
    const schemaId = await this.#getObjectTypeIdFromNameOrId(params.name);
    const response = await this.#client.crm.schemas.coreApi.getById(schemaId);
    const existingObject = toCustomObject(response);

    // Figure out which fields to create/update/delete
    const fieldNamesToDelete = existingObject.fields
      .map((field) => field.id)
      .filter((id) => !id.startsWith('hs_') && !id.startsWith('hubspot_'))
      .filter((id) => {
        return !params.fields.map((field) => field.id).includes(id);
      });
    if (fieldNamesToDelete.length) {
      throw new BadRequestError(
        `Cannot delete fields from custom object schema in hubspot. Fields to delete: ${fieldNamesToDelete.join(', ')}`
      );
    }
    const fieldsToUpdate = params.fields.filter((field) => {
      const existingField = existingObject.fields.find((f) => f.id === field.id);
      if (!existingField) {
        return false;
      }

      return (
        field.label !== existingField.label ||
        field.type !== existingField.type ||
        field.isRequired !== existingField.isRequired
      );
    });
    const fieldsToCreate = params.fields.filter((field) => !existingObject.fields.map((f) => f.id).includes(field.id));

    // Update fields
    for (const field of fieldsToUpdate) {
      await this.#client.crm.properties.coreApi.update(response.objectTypeId, field.id, {
        label: field.label,
        options: getHubspotOptions(field),
        ...toHubspotTypeAndFieldType(field.type),
      });
    }

    // Create fields
    // TODO: We should not assume that there is only one group
    const { results: groups } = await this.#client.crm.properties.groupsApi.getAll(response.objectTypeId);
    const unarchivedGroups = groups.filter((group) => !group.archived);
    if (!unarchivedGroups.length || unarchivedGroups.length > 1) {
      throw new Error('Expected exactly one property group');
    }

    await this.#client.crm.properties.batchApi.create(response.objectTypeId, {
      inputs: fieldsToCreate.map((field) => ({
        name: field.id,
        label: field.label,
        options: getHubspotOptions(field),
        ...toHubspotTypeAndFieldType(field.type),
        groupName: unarchivedGroups[0].name, // TODO
      })),
    });

    const labels =
      params.labels.singular === existingObject.labels.singular && params.labels.plural === existingObject.labels.plural
        ? undefined
        : params.labels;

    // Update the main object
    await this.#client.crm.schemas.coreApi.update(response.objectTypeId, {
      // ignoring name because you can't update that in hubspot
      labels,
      requiredProperties: params.fields.filter((field) => field.isRequired).map((field) => field.id),
    });
  }

  public override async listAssociationSchemas(
    sourceObject: string,
    targetObject: string
  ): Promise<SimpleAssociationSchema[]> {
    await this.maybeRefreshAccessToken();
    sourceObject = await this.#getObjectTypeIdFromNameOrId(sourceObject);
    targetObject = await this.#getObjectTypeIdFromNameOrId(targetObject);
    const response = await this.#client.crm.associations.v4.schema.definitionsApi.getAll(sourceObject, targetObject);
    return response.results.map((result) => ({
      id: result.typeId.toString(),
      displayName: result.label ?? '',
    }));
  }

  public override async createAssociationSchema(
    sourceObject: string,
    targetObject: string,
    id: string,
    label: string
  ): Promise<AssociationSchema> {
    await this.maybeRefreshAccessToken();
    sourceObject = await this.#getObjectTypeIdFromNameOrId(sourceObject);
    targetObject = await this.#getObjectTypeIdFromNameOrId(targetObject);
    await this.#client.crm.associations.v4.schema.definitionsApi.create(sourceObject, targetObject, {
      label: label,
      name: id,
    });
    const response = await this.#client.crm.associations.v4.schema.definitionsApi.getAll(sourceObject, targetObject);
    const created = response.results.find((result) => result.label === label);
    if (!created) {
      throw new InternalServerError(`Unable to create association schema`, { origin: 'remote-provider' });
    }
    return {
      id: created.typeId.toString(),
      targetObject,
      sourceObject,
      displayName: label,
    };
  }

  public override async createAssociation(params: AssociationCreateParams): Promise<Association> {
    await this.maybeRefreshAccessToken();
    const sourceObjectTypeId = await this.#getObjectTypeIdFromNameOrId(params.sourceRecord.objectName);
    const targetObjectTypeId = await this.#getObjectTypeIdFromNameOrId(params.targetRecord.objectName);
    const response = await this.#client.crm.associations.v4.schema.definitionsApi.getAll(
      sourceObjectTypeId,
      targetObjectTypeId
    );
    const associationSchema = response.results.find(
      (result) => result.typeId.toString() === params.associationSchemaId
    );
    if (!associationSchema) {
      throw new NotFoundError(`Could not find association schema with id ${params.associationSchemaId}`);
    }
    const associationCategory = associationSchema.category;
    const createResponse = await this.#client.crm.associations.v4.batchApi.create(
      sourceObjectTypeId,
      targetObjectTypeId,
      {
        inputs: [
          {
            _from: { id: params.sourceRecord.id },
            to: { id: params.targetRecord.id },
            types: [
              {
                associationCategory,
                associationTypeId: parseInt(params.associationSchemaId),
              },
            ],
          },
        ],
      }
    );
    if ((createResponse as BatchResponseLabelsBetweenObjectPairWithErrors).errors?.length) {
      throw new InternalServerError(
        `Error creating association: ${
          (createResponse as BatchResponseLabelsBetweenObjectPairWithErrors).errors?.[0].message ?? 'Unknown Error'
        }`,
        { origin: 'remote-provider' }
      );
    }

    return params;
  }

  public override async listLists(
    objectType: Exclude<CRMCommonObjectType, 'user'>,
    paginationParams: PaginationParams
  ): Promise<PaginatedSupaglueRecords<ListMetadata>> {
    if (!HUBSPOT_LIST_OBJECT_TYPES.includes(objectType)) {
      throw new BadRequestError(`Listing ${objectType} lists is not supported in HubSpot`);
    }

    const cursor = paginationParams.cursor ? decodeCursor(paginationParams.cursor) : undefined;
    const pageSize =
      paginationParams.page_size === undefined ? HUBSPOT_RECORD_LIMIT : parseInt(paginationParams.page_size);

    let hubspotLists: any[] = [];

    let offset = cursor?.id;
    let hasMore = true;

    while (hubspotLists.length < pageSize && hasMore) {
      const v3Response = await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        return await axios.post(
          `https://api.hubapi.com/crm/v3/lists/search`,
          {
            count: pageSize,
            offset,
          },
          {
            headers: {
              Authorization: `Bearer ${this.#config.accessToken}`,
            },
          }
        );
      });
      const objectTypeId = HUBSPOT_LIST_OBJECT_TYPE_ID_MAP[objectType as 'contact' | 'account' | 'opportunity'];
      hubspotLists = [
        ...hubspotLists,
        ...v3Response.data.lists.filter((list: any) => list.objectTypeId === objectTypeId),
      ];
      ({ offset, hasMore } = v3Response.data);
    }

    return {
      records: hubspotLists.map((record: any) => ({
        name: record.name,
        label: record.name,
        id: record.listId.toString(),
        objectType,
        rawData: record,
      })),
      pagination: {
        next:
          hasMore && offset
            ? encodeCursor({
                id: offset,
                reverse: false,
              })
            : null,
        previous: null,
      },
    };
  }

  public override async listListMembership<T extends ListCRMCommonObject>(
    objectType: T,
    listId: string,
    paginationParams: PaginationParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<ListCRMCommonObjectTypeMap<T>>> {
    if (!HUBSPOT_LIST_OBJECT_TYPES.includes(objectType)) {
      throw new BadRequestError(`Listing ${objectType} lists is not supported in HubSpot`);
    }

    const hubspotObjectName =
      COMMON_MODEL_TO_HUBSPOT_OBJECT_TYPE_MAP[objectType as 'contact' | 'account' | 'opportunity'];

    const cursor = paginationParams.cursor ? decodeCursor(paginationParams.cursor) : undefined;
    const pageSize = paginationParams.page_size ?? HUBSPOT_RECORD_LIMIT;
    const propertiesToFetch = await this.getCommonObjectPropertyIdsToFetch(hubspotObjectName, fieldMappingConfig);

    const [v3MembershipResponse] = await Promise.all([
      retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        return axios.get(`https://api.hubapi.com/crm/v3/lists/${listId}/memberships`, {
          headers: {
            Authorization: `Bearer ${this.#config.accessToken}`,
          },
          params: {
            after: cursor?.id,
            limit: pageSize,
          },
        });
      }),
    ]);

    let records: ListCRMCommonObjectTypeMap<T>[] = [];

    // Make a Hubspot V3 Contact batch call using the record id (hs_object_id) from the V1 call so we can use our existing CRM Contact common schema
    // https://developers.hubspot.com/docs/api/crm/contacts#retrieve-contacts
    switch (hubspotObjectName) {
      case 'contact':
        {
          const batchResponseSimplePublicObject = await this.#client.crm.contacts.batchApi.read({
            properties: propertiesToFetch,
            propertiesWithHistory: [],
            inputs: v3MembershipResponse.data.results.map((id: string) => ({
              id,
            })),
          });
          records = batchResponseSimplePublicObject.results.map((result) => {
            return {
              ...fromHubSpotContactToContact({
                id: result.id,
                properties: result.properties,
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString(),
                archived: false,
                // NOTE: we don't support full associations here, unlike in CRM List
              }),
              rawData: toMappedProperties(result, fieldMappingConfig),
            };
          }) as ListCRMCommonObjectTypeMap<T>[];
        }
        break;
      case 'company': {
        const batchResponseSimplePublicObject = await this.#client.crm.companies.batchApi.read({
          properties: propertiesToFetch,
          propertiesWithHistory: [],
          inputs: v3MembershipResponse.data.results.map((id: string) => ({
            id,
          })),
        });
        records = batchResponseSimplePublicObject.results.map((result) => {
          return {
            ...fromHubSpotCompanyToAccount({
              id: result.id,
              properties: result.properties,
              createdAt: result.createdAt.toISOString(),
              updatedAt: result.updatedAt.toISOString(),
              archived: false,
              // NOTE: we don't support full associations here, unlike in CRM List
            }),
            rawData: toMappedProperties(result, fieldMappingConfig),
          };
        }) as ListCRMCommonObjectTypeMap<T>[];
        break;
      }
      case 'deal': {
        const pipelineStageMapping = await this.#getPipelineStageMapping();
        const batchResponseSimplePublicObject = await this.#client.crm.deals.batchApi.read({
          properties: propertiesToFetch,
          propertiesWithHistory: [],
          inputs: v3MembershipResponse.data.results.map((id: string) => ({
            id,
          })),
        });
        records = batchResponseSimplePublicObject.results.map((result) => {
          return {
            ...fromHubSpotDealToOpportunity(
              {
                id: result.id,
                properties: result.properties,
                createdAt: result.createdAt.toISOString(),
                updatedAt: result.updatedAt.toISOString(),
                archived: false,
                // NOTE: we don't support full associations here, unlike in CRM List
              },
              pipelineStageMapping
            ),
            rawData: toMappedProperties(result, fieldMappingConfig),
          };
        }) as ListCRMCommonObjectTypeMap<T>[];
        break;
      }
    }
    // Map response to ListMetadata interface
    return {
      records,
      pagination: {
        next: v3MembershipResponse.data.paging?.next?.after
          ? encodeCursor({
              id: v3MembershipResponse.data.paging.next.after,
              reverse: false,
            })
          : null,
        previous: null,
      },
    };
  }

  public async dirtyRecordForAssociations(
    standardObjectType: 'contact' | 'company' | 'deal',
    recordId: string
  ): Promise<void> {
    await this.maybeRefreshAccessToken();
    try {
      await this.#dirtyRecordForAssociationsImpl(standardObjectType, recordId);
    } catch (e: any) {
      if (e.code === 400 && e.body?.message?.includes('PROPERTY_DOESNT_EXIST')) {
        await this.createProperty(standardObjectType, {
          name: SUPAGLUE_ASSOCIATIONS_TIMESTAMP_PROPERTY_NAME,
          label: 'Associations Last Updated Timestamp',
          type: 'datetime',
          isRequired: false,
        });
        await this.#dirtyRecordForAssociationsImpl(standardObjectType, recordId);
        return;
      }
      throw e;
    }
  }

  async #dirtyRecordForAssociationsImpl(
    standardObjectType: 'contact' | 'company' | 'deal',
    recordId: string
  ): Promise<void> {
    await this.maybeRefreshAccessToken();
    const payload = {
      properties: {
        [SUPAGLUE_ASSOCIATIONS_TIMESTAMP_PROPERTY_NAME]: new Date().toISOString(),
      },
    };
    switch (standardObjectType) {
      case 'contact': {
        await this.#client.crm.contacts.basicApi.update(recordId, payload);
        return;
      }
      case 'company': {
        await this.#client.crm.companies.basicApi.update(recordId, payload);
        return;
      }
      case 'deal': {
        await this.#client.crm.deals.basicApi.update(recordId, payload);
        return;
      }
      default: {
        throw new Error(`Unsupported object type ${standardObjectType}`);
      }
    }
  }

  public override async handleErr(err: unknown): Promise<unknown> {
    // for errors we throw ourselves, they aren't native hubspot client errors, so don't continue
    // to unroll the error body message
    if (err instanceof SGError) {
      throw err;
    }

    let error = err as any;
    let message = error.body?.message;
    let { code: status } = error;
    if (isAxiosError(err)) {
      message = err.response?.data.message;
      status = err.response?.status;
      error = err.response?.data;
    }

    switch (status) {
      case 400:
        if (
          message === 'one or more associations are not valid' ||
          message.includes('Some required properties were not set')
        ) {
          return new BadRequestError(message, { cause: error, origin: 'remote-provider', status });
        }
        if (message.includes('missing or invalid refresh token')) {
          return new SGConnectionNoLongerAuthenticatedError(message, status, error);
        }
        return new InternalServerError(message, { cause: error, origin: 'remote-provider', status });
      case 401:
        return new UnauthorizedError(message, { cause: error, origin: 'remote-provider', status });
      case 403:
        return new ForbiddenError(message, { cause: error, origin: 'remote-provider', status });
      case 404:
        return new NotFoundError(message, { cause: error, origin: 'remote-provider', status });
      case 409:
        return new ConflictError(message, { cause: error, origin: 'remote-provider', status });
      case 429:
        return new TooManyRequestsError(message, { cause: error, origin: 'remote-provider', status });
      // The following are unmapped to Supaglue errors, but we want to pass
      // them back as 4xx so they aren't 500 and developers can view error messages
      case 402:
      case 405:
      case 406:
      case 407:
      case 408:
      case 410:
      case 411:
      case 412:
      case 413:
      case 414:
      case 415:
      case 416:
      case 417:
      case 418:
      case 419:
      case 420:
      case 421:
      case 422:
      case 423:
      case 424:
      case 425:
      case 426:
      case 427:
      case 428:
      case 430:
      case 431:
      case 432:
      case 433:
      case 434:
      case 435:
      case 436:
      case 437:
      case 438:
      case 439:
      case 440:
      case 441:
      case 442:
      case 443:
      case 444:
      case 445:
      case 446:
      case 447:
      case 448:
      case 449:
      case 450:
      case 451:
        return new RemoteProviderError(message, { cause: error, status });
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
    instanceUrl: connection.instanceUrl,
    applicationId: connection.applicationId,
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
  },
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
  },
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

function filterForArchivedAfterISOString<
  R extends {
    results: { archivedAt?: string }[];
  },
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

function getMetadataFromRecord(record: HubSpotAPIV3GetRecordResponse): ObjectMetadata {
  return {
    isDeleted: record.archived,
    // We don't support getting archived records, so we don't need to check for archivedAt
    lastModifiedAt: new Date(record.updatedAt),
  };
}

function flattenAssociations(
  associations:
    | Record<
        string,
        {
          results: HubSpotAPIV3ListResponseAssociationResult[];
        }
      >
    | undefined,
  associatedCustomObjectSchemas: HubSpotCustomSchema[]
): Record<string, string[]> {
  return Object.entries(associations ?? {}).reduce(
    (acc, [associatedObjectTypeKey, { results }]) => {
      const dedupedIds = [...new Set(results.map(({ id }) => id))];
      // If associatedObjectType is for a standard object, it will be pluralized, and we should use the singular form
      if (HUBSPOT_STANDARD_OBJECT_TYPES_PLURALIZED.includes(associatedObjectTypeKey)) {
        if (!(associatedObjectTypeKey in hubspotStandardObjectPluralizedToType)) {
          throw new Error(`Couldn't find matching standard object type for ${associatedObjectTypeKey}`);
        }
        const standardObjectType = hubspotStandardObjectPluralizedToType[associatedObjectTypeKey];
        acc[standardObjectType] = dedupedIds;
        return acc;
      }

      const matchingCustomObjectSchema = associatedCustomObjectSchemas.find(
        (schema) => schema.fullyQualifiedName === associatedObjectTypeKey
      );
      if (!matchingCustomObjectSchema) {
        throw new Error(`Couldn't find matching custom object schema for ${associatedObjectTypeKey}`);
      }
      acc[matchingCustomObjectSchema.name] = dedupedIds;
      return acc;
    },
    {} as Record<string, string[]>
  );
}

function shouldFetchAllAssociations(applicationId: string): boolean {
  return FETCH_ASSOCIATIONS_APPLICATION_IDS.includes(applicationId);
}
