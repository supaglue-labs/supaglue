import axios, { AxiosError } from '@supaglue/core/remotes/sg_axios';
import type {
  ConnectionUnsafe,
  CRMProvider,
  Property,
  PropertyUnified,
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
  ContactUpsertParams,
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  CrmGetParams,
  CrmListParams,
  Lead,
  LeadCreateParams,
  LeadUpdateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityUpdateParams,
  User,
} from '@supaglue/types/crm';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { Readable } from 'stream';
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  RemoteProviderError,
  SGConnectionNoLongerAuthenticatedError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../errors';
import type { PaginatedSupaglueRecords } from '../../../lib';
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  encodeCursor,
  REFRESH_TOKEN_THRESHOLD_MS,
  retryWhenAxiosRateLimited,
} from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';
import { paginator } from '../../utils/paginator';
import { toMappedProperties } from '../../utils/properties';
import {
  fromFieldTypeToPropertyType,
  fromPipedriveDealToOpportunity,
  fromPipedriveLeadToLead,
  fromPipedriveOrganizationToAccount,
  fromPipedrivePersonToContact,
  fromPipedriveUserToUser,
  toPipedriveDealCreateParams,
  toPipedriveDealUpdateParams,
  toPipedriveLeadCreateParams,
  toPipedriveLeadUpdateParams,
  toPipedriveOrganizationCreateParams,
  toPipedriveOrganizationUpdateParams,
  toPipedrivePersonCreateParams,
  toPipedrivePersonUpdateParams,
} from './mappers';
import type { PipedriveObjectField } from './types';

const PIPEDRIVE_RECORD_LIMIT = 500;

const DEFAULT_LIST_PARAMS = {
  limit: PIPEDRIVE_RECORD_LIMIT,
  sort: 'id',
};

type PipedriveObjectSupportingCustomFields = 'person' | 'lead' | 'deal' | 'organization';

export type PipedriveRecord = { [key: string]: any };

export type PipelineStageMapping = Record<string, { label: string; stageIdsToLabels: Record<string, string> }>;

type PipedrivePaginatedRecords = {
  success: boolean;
  data: PipedriveRecord[] | null;
  additional_data: {
    pagination?: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
      next_start?: number;
    };
  };
};

export type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
};

type PipedriveObjectFieldsResponse = {
  success: true;
  data: PipedriveObjectField[];
  additional_data: {
    pagination?: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
      next_start?: number;
    };
  };
};

class PipedriveClient extends AbstractCrmRemoteClient {
  readonly #credentials: Credentials;
  #headers: Record<string, string>;
  public constructor(credentials: Credentials) {
    super(credentials.instanceUrl);
    this.#credentials = credentials;
    this.#headers = { Authorization: `Bearer ${this.#credentials.accessToken}` };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.#headers;
  }

  private getBasicAuthorizationToken(): string {
    return Buffer.from(`${this.#credentials.clientId}:${this.#credentials.clientSecret}`).toString('base64');
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (
      !this.#credentials.expiresAt ||
      Date.parse(this.#credentials.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS
    ) {
      try {
        const response = await axios.post<{ access_token: string; refresh_token: string; expires_in: number }>(
          `${authConfig.tokenHost}${authConfig.tokenPath}`,
          {
            grant_type: 'refresh_token',
            refresh_token: this.#credentials.refreshToken,
          },
          {
            headers: {
              Authorization: `Basic ${this.getBasicAuthorizationToken()}`,
              'Content-type': 'application/x-www-form-urlencoded',
            },
          }
        );

        const newAccessToken = response.data.access_token;
        const newRefreshToken = response.data.refresh_token;
        const newExpiresAt = new Date(Date.now() + response.data.expires_in * 1000).toISOString();

        this.#credentials.accessToken = newAccessToken;
        this.#credentials.refreshToken = newRefreshToken;
        this.#credentials.expiresAt = newExpiresAt;
        this.#headers = { Authorization: `Bearer ${newAccessToken}` };

        this.emit('token_refreshed', {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresAt: newExpiresAt,
        });
      } catch (e: any) {
        if (e.response?.status === 400) {
          throw new SGConnectionNoLongerAuthenticatedError('Unable to refresh access token. Refresh token invalid.');
        }
        throw e;
      }
    }
  }

  public override async streamCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'contact':
        return await this.streamContacts(fieldMappingConfig, updatedAfter);
      case 'lead':
        return await this.streamLeads(fieldMappingConfig, updatedAfter);
      case 'opportunity':
        return await this.streamOpportunities(fieldMappingConfig, updatedAfter);
      case 'account':
        return await this.streamAccounts(fieldMappingConfig, updatedAfter);
      case 'user':
        return await this.streamUsers(fieldMappingConfig, updatedAfter);
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
        return await this.listContacts(fieldMappingConfig, params);
      case 'lead':
        return await this.listLeads(fieldMappingConfig, params);
      case 'opportunity':
        return await this.listOpportunities(fieldMappingConfig, params);
      case 'account':
        return await this.listAccounts(fieldMappingConfig, params);
      case 'user':
        return await this.listUsers(fieldMappingConfig, params);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  #getListRecordsFetcher(
    endpoint: string,
    updatedAfter?: Date,
    limit = PIPEDRIVE_RECORD_LIMIT
  ): (next_start?: string) => Promise<PipedrivePaginatedRecords> {
    // Pipedrive does not support incremental fetch (i.e. filtering by datetime) so we will do full refresh every time
    return async (next_start?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        // subsequent pages
        if (next_start) {
          const response = await axios.get<PipedrivePaginatedRecords>(endpoint, {
            params: {
              ...DEFAULT_LIST_PARAMS,
              limit,
              start: parseInt(next_start),
            },
            headers: this.#headers,
          });

          return filterForUpdatedAfter(response.data, updatedAfter);
        }

        // first page
        const response = await axios.get<PipedrivePaginatedRecords>(endpoint, {
          params: { ...DEFAULT_LIST_PARAMS, limit },
          headers: this.#headers,
        });
        return filterForUpdatedAfter(response.data, updatedAfter);
      });
    };
  }

  private async listContacts(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<Contact>> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/persons`,
      params.modifiedAfter,
      params.pageSize ?? DEFAULT_PAGE_SIZE
    );
    const fields = await this.#getCustomFieldsForObject('person');
    const mapper = (
      result: PipedriveRecord,
      fields: PipedriveObjectField[],
      fieldMappingConfig: FieldMappingConfig
    ): Contact => {
      const contact = fromPipedrivePersonToContact(result, fields);
      return {
        ...contact,
        rawData: params.includeRawData ? toMappedProperties(contact.rawData, fieldMappingConfig) : undefined,
      };
    };
    const cursor = decodeCursor(params.cursor);
    const response = await normalPageFetcher(cursor?.id.toString());
    if (!response.data) {
      throw new Error('Unexpected response from Pipedrive');
    }
    const records = response.data.map((result) => mapper(result, fields, fieldMappingConfig));
    const nextCursor = response.additional_data.pagination?.next_start?.toString();
    return {
      records,
      pagination: {
        next: nextCursor ? encodeCursor({ id: nextCursor, reverse: false }) : null,
        previous: null,
      },
    };
  }

  private async streamContacts(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/persons`,
      updatedAfter
    );
    const fields = await this.#getCustomFieldsForObject('person');
    const mapper = (
      result: PipedriveRecord,
      fields: PipedriveObjectField[],
      fieldMappingConfig: FieldMappingConfig
    ): Contact => {
      const contact = fromPipedrivePersonToContact(result, fields);
      return { ...contact, rawData: toMappedProperties(contact.rawData, fieldMappingConfig) };
    };
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              record: mapper(result, fields, fieldMappingConfig),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  private async streamLeads(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/leads`,
      updatedAfter
    );
    const fields = await this.#getCustomFieldsForObject('lead');
    const mapper = (
      result: PipedriveRecord,
      fields: PipedriveObjectField[],
      fieldMappingConfig: FieldMappingConfig
    ): Lead => {
      const lead = fromPipedriveLeadToLead(result, fields);
      return { ...lead, rawData: toMappedProperties(lead.rawData, fieldMappingConfig) };
    };
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              record: mapper(result, fields, fieldMappingConfig),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  private async listLeads(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<Lead>> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/leads`,
      params.modifiedAfter,
      params.pageSize ?? DEFAULT_PAGE_SIZE
    );
    const fields = await this.#getCustomFieldsForObject('lead');
    const mapper = (
      result: PipedriveRecord,
      fields: PipedriveObjectField[],
      fieldMappingConfig: FieldMappingConfig
    ): Lead => {
      const lead = fromPipedriveLeadToLead(result, fields);
      return {
        ...lead,
        rawData: params.includeRawData ? toMappedProperties(lead.rawData, fieldMappingConfig) : undefined,
      };
    };
    const cursor = decodeCursor(params.cursor);
    const response = await normalPageFetcher(cursor?.id.toString());
    if (!response.data) {
      throw new Error('Unexpected response from Pipedrive');
    }
    const records = response.data.map((result) => mapper(result, fields, fieldMappingConfig));
    const nextCursor = response.additional_data.pagination?.next_start?.toString();
    return {
      records,
      pagination: {
        next: nextCursor ? encodeCursor({ id: nextCursor, reverse: false }) : null,
        previous: null,
      },
    };
  }

  async #getPipelineStageMapping(): Promise<PipelineStageMapping> {
    await this.maybeRefreshAccessToken();
    const response = await axios.get(`${this.#credentials.instanceUrl}/api/v1/stages`, {
      headers: this.#headers,
    });
    const pipelineStageMapping: PipelineStageMapping = {};
    response.data.data.forEach(
      ({
        id,
        name,
        pipeline_id,
        pipeline_name,
      }: {
        id: number;
        name: string;
        pipeline_id: number;
        pipeline_name: string;
      }) => {
        if (pipelineStageMapping[pipeline_id.toString()]) {
          pipelineStageMapping[pipeline_id.toString()].stageIdsToLabels[id.toString()] = name;
        } else {
          pipelineStageMapping[pipeline_id.toString()] = {
            label: pipeline_name,
            stageIdsToLabels: { [id.toString()]: name },
          };
        }
      }
    );
    return pipelineStageMapping;
  }

  private async streamOpportunities(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/deals`,
      updatedAfter
    );
    const fields = await this.#getCustomFieldsForObject('deal');
    const mapper = (
      result: PipedriveRecord,
      pipelineStageMapping: PipelineStageMapping,
      fields: PipedriveObjectField[],
      fieldMappingConfig: FieldMappingConfig
    ): Opportunity => {
      const opportunity = fromPipedriveDealToOpportunity(result, pipelineStageMapping, fields);
      return { ...opportunity, rawData: toMappedProperties(opportunity.rawData, fieldMappingConfig) };
    };
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((record) => ({
              record: mapper(record, pipelineStageMapping, fields, fieldMappingConfig),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  private async listOpportunities(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<Opportunity>> {
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/deals`,
      params.modifiedAfter,
      params.pageSize ?? DEFAULT_PAGE_SIZE
    );
    const fields = await this.#getCustomFieldsForObject('deal');
    const mapper = (
      result: PipedriveRecord,
      fields: PipedriveObjectField[],
      fieldMappingConfig: FieldMappingConfig
    ): Opportunity => {
      const opportunity = fromPipedriveDealToOpportunity(result, pipelineStageMapping, fields);
      return {
        ...opportunity,
        rawData: params.includeRawData ? toMappedProperties(opportunity.rawData, fieldMappingConfig) : undefined,
      };
    };
    const cursor = decodeCursor(params.cursor);
    const response = await normalPageFetcher(cursor?.id.toString());
    if (!response.data) {
      throw new Error('Unexpected response from Pipedrive');
    }
    const records = response.data.map((result) => mapper(result, fields, fieldMappingConfig));
    const nextCursor = response.additional_data.pagination?.next_start?.toString();
    return {
      records,
      pagination: {
        next: nextCursor ? encodeCursor({ id: nextCursor, reverse: false }) : null,
        previous: null,
      },
    };
  }

  private async streamAccounts(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/organizations`,
      updatedAfter
    );
    const fields = await this.#getCustomFieldsForObject('organization');
    const mapper = (
      result: PipedriveRecord,
      fields: PipedriveObjectField[],
      fieldMappingConfig: FieldMappingConfig
    ): Account => {
      const account = fromPipedriveOrganizationToAccount(result, fields);
      return { ...account, rawData: toMappedProperties(account.rawData, fieldMappingConfig) };
    };
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              record: mapper(result, fields, fieldMappingConfig),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  private async listAccounts(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<Account>> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/organizations`,
      params.modifiedAfter,
      params.pageSize ?? DEFAULT_PAGE_SIZE
    );
    const fields = await this.#getCustomFieldsForObject('organization');
    const mapper = (
      result: PipedriveRecord,
      fields: PipedriveObjectField[],
      fieldMappingConfig: FieldMappingConfig
    ): Account => {
      const account = fromPipedriveOrganizationToAccount(result, fields);
      return {
        ...account,
        rawData: params.includeRawData ? toMappedProperties(account.rawData, fieldMappingConfig) : undefined,
      };
    };
    const cursor = decodeCursor(params.cursor);
    const response = await normalPageFetcher(cursor?.id.toString());
    if (!response.data) {
      throw new Error('Unexpected response from Pipedrive');
    }
    const records = response.data.map((result) => mapper(result, fields, fieldMappingConfig));
    const nextCursor = response.additional_data.pagination?.next_start?.toString();
    return {
      records,
      pagination: {
        next: nextCursor ? encodeCursor({ id: nextCursor, reverse: false }) : null,
        previous: null,
      },
    };
  }

  private async streamUsers(fieldMappingConfig: FieldMappingConfig, updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/users`,
      updatedAfter
    );
    const mapper = (result: PipedriveRecord, fieldMappingConfig: FieldMappingConfig): User => {
      const user = fromPipedriveUserToUser(result);
      return { ...user, rawData: toMappedProperties(user.rawData, fieldMappingConfig) };
    };
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              record: mapper(result, fieldMappingConfig),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  private async listUsers(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<User>> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/users`,
      params.modifiedAfter,
      params.pageSize ?? DEFAULT_PAGE_SIZE
    );
    const mapper = (result: PipedriveRecord, fieldMappingConfig: FieldMappingConfig): User => {
      const user = fromPipedriveUserToUser(result);
      return {
        ...user,
        rawData: params.includeRawData ? toMappedProperties(user.rawData, fieldMappingConfig) : undefined,
      };
    };
    const cursor = decodeCursor(params.cursor);
    const response = await normalPageFetcher(cursor?.id.toString());
    if (!response.data) {
      throw new Error('Unexpected response from Pipedrive');
    }
    const records = response.data.map((result) => mapper(result, fieldMappingConfig));
    const nextCursor = response.additional_data.pagination?.next_start?.toString();
    return {
      records,
      pagination: {
        next: nextCursor ? encodeCursor({ id: nextCursor, reverse: false }) : null,
        previous: null,
      },
    };
  }

  public override async getCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    id: string,
    fieldMappingConfig: FieldMappingConfig,
    params: CRMCommonObjectTypeMap<T>['getParams']
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    switch (commonObjectType) {
      case 'contact':
        return await this.getContact(id, fieldMappingConfig, params);
      case 'lead':
        return await this.getLead(id, fieldMappingConfig, params);
      case 'opportunity':
        return await this.getOpportunity(id, fieldMappingConfig, params);
      case 'account':
        return await this.getAccount(id, fieldMappingConfig, params);
      case 'user':
        return await this.getUser(id, fieldMappingConfig, params);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async getContact(id: string, fieldMappingConfig: FieldMappingConfig, params: CrmGetParams): Promise<Contact> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('person');
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/persons/${id}`, {
      headers: this.#headers,
    });
    const contact = fromPipedrivePersonToContact(response.data.data, fields);
    return {
      ...contact,
      rawData: params.includeRawData ? toMappedProperties(contact.rawData, fieldMappingConfig) : undefined,
    };
  }

  async getLead(id: string, fieldMappingConfig: FieldMappingConfig, params: CrmGetParams): Promise<Lead> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('lead');
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/leads/${id}`, {
      headers: this.#headers,
    });
    const lead = fromPipedriveLeadToLead(response.data.data, fields);
    return {
      ...lead,
      rawData: params.includeRawData ? toMappedProperties(lead.rawData, fieldMappingConfig) : undefined,
    };
  }

  async getOpportunity(id: string, fieldMappingConfig: FieldMappingConfig, params: CrmGetParams): Promise<Opportunity> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('deal');
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/deals/${id}`, {
      headers: this.#headers,
    });
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const opportunity = fromPipedriveDealToOpportunity(response.data.data, pipelineStageMapping, fields);
    return {
      ...opportunity,
      rawData: params.includeRawData ? toMappedProperties(opportunity.rawData, fieldMappingConfig) : undefined,
    };
  }

  async getAccount(id: string, fieldMappingConfig: FieldMappingConfig, params: CrmGetParams): Promise<Account> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('organization');
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/organizations/${id}`, {
      headers: this.#headers,
    });
    const account = fromPipedriveOrganizationToAccount(response.data.data, fields);
    return {
      ...account,
      rawData: params.includeRawData ? toMappedProperties(account.rawData, fieldMappingConfig) : undefined,
    };
  }

  async getUser(id: string, fieldMappingConfig: FieldMappingConfig, params: CrmGetParams): Promise<User> {
    await this.maybeRefreshAccessToken();
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/users/${id}`, {
      headers: this.#headers,
    });
    const user = fromPipedriveUserToUser(response.data.data);
    return {
      ...user,
      rawData: params.includeRawData ? toMappedProperties(user.rawData, fieldMappingConfig) : undefined,
    };
  }

  public override async createCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    switch (commonObjectType) {
      case 'contact':
        return await this.createContact(params);
      case 'lead':
        return await this.createLead(params);
      case 'opportunity':
        return await this.createOpportunity(params);
      case 'account':
        return await this.createAccount(params);
      case 'user':
        throw new BadRequestError('User creation is not supported');
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  public override async upsertCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['upsertParams']
  ): Promise<string> {
    switch (commonObjectType) {
      case 'contact':
        return this.upsertContact(params as ContactUpsertParams);
      default:
        throw new Error(`Upsert is not supported for ${commonObjectType} in pipedrive`);
    }
  }

  getFieldsPrefix(objectName: string): string {
    if (objectName === 'lead') {
      return 'deal';
    }
    return objectName;
  }

  public override async listProperties(object: StandardOrCustomObjectDef): Promise<Property[]> {
    return await this.listPropertiesForRawObjectName(object.name);
  }

  public async listPropertiesForRawObjectName(objectName: string): Promise<Property[]> {
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      // TODO: Handle pagination. We're assuming that by not passing in a limit param, we get all the fields.
      // This may be an incorrect assumption
      const response = await axios.get<PipedriveObjectFieldsResponse>(
        `${this.#credentials.instanceUrl}/api/v1/${this.getFieldsPrefix(
          objectName
        )}Fields:(key,name,edit_flag,field_type,options)`,
        {
          headers: this.#headers,
        }
      );
      // Note: For custom fields, we reference using the label.
      return response.data.data.map(({ key, name, edit_flag }) =>
        edit_flag ? { id: name, label: name } : { id: key, label: name }
      );
    });
  }

  public async listPropertiesUnified(objectName: string): Promise<PropertyUnified[]> {
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      // TODO: Handle pagination. We're assuming that by not passing in a limit param, we get all the fields.
      // This may be an incorrect assumption
      const response = await axios.get<PipedriveObjectFieldsResponse>(
        `${this.#credentials.instanceUrl}/api/v1/${this.getFieldsPrefix(objectName)}Fields`,
        {
          headers: this.#headers,
        }
      );
      return response.data.data.map((field) => {
        // Note: For custom fields, we reference using the label.
        const id = field.edit_flag ? field.name : field.key;
        const customName = field.edit_flag ? field.key : undefined;
        return {
          id,
          customName,
          label: field.name,
          type: fromFieldTypeToPropertyType(field.field_type),
          isRequired: field.mandatory_flag === true, // not handling the more complex case since it's not unifyable
          options:
            'options' in field
              ? field.options.map((option) => ({
                  label: option.label,
                  value: option.id.toString(),
                }))
              : undefined,
          rawDetails: field,
        };
      });
    });
  }

  async #getCustomFieldsForObject(object: PipedriveObjectSupportingCustomFields): Promise<PipedriveObjectField[]> {
    await this.maybeRefreshAccessToken();
    // TODO: Handle pagination. We're assuming that by not passing in a limit param, we get all the fields.
    // This may be an incorrect assumption
    const response = await axios.get<PipedriveObjectFieldsResponse>(
      `${this.#credentials.instanceUrl}/api/v1/${this.getFieldsPrefix(
        object
      )}Fields:(key,name,edit_flag,field_type,options)`,
      {
        headers: this.#headers,
      }
    );
    return response.data.data.filter((field) => field.edit_flag);
  }

  async createContact(params: ContactCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('person');
    const response = await axios.post<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/persons`,
      toPipedrivePersonCreateParams(params, fields),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async upsertContact(params: ContactUpsertParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const ids = (
      await Promise.all(
        params.upsertOn.values.map(async (value) => {
          const response = await axios.get<{ data: { items: { item: { id: number } }[] } }>(
            `${this.#credentials.instanceUrl}/api/v1/persons/search`,
            {
              headers: this.#headers,
              params: {
                term: value,
                fields: 'email',
                exact_match: true,
              },
            }
          );
          if (response.data.data.items.length > 1) {
            throw new BadRequestError(`Multiple contacts found for email ${value}`);
          }
          return response.data.data.items.map((item) => item.item.id.toString());
        })
      )
    ).flat();
    if (ids.length > 1) {
      throw new BadRequestError(`Multiple contacts found for upsert query`);
    }
    if (ids.length === 0) {
      return this.createContact(params.record);
    }
    return this.updateContact({ ...params.record, id: ids[0] });
  }

  async createLead(params: LeadCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('lead');
    const response = await axios.post<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/leads`,
      toPipedriveLeadCreateParams(params, fields),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async createAccount(params: AccountCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('organization');
    const response = await axios.post<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/organizations`,
      toPipedriveOrganizationCreateParams(params, fields),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async createOpportunity(params: OpportunityCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const fields = await this.#getCustomFieldsForObject('deal');
    const response = await axios.post<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/deals`,
      toPipedriveDealCreateParams(params, pipelineStageMapping, fields),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  public override async updateCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<string> {
    switch (commonObjectType) {
      case 'contact':
        return await this.updateContact(params);
      case 'lead':
        return await this.updateLead(params);
      case 'opportunity':
        return await this.updateOpportunity(params);
      case 'account':
        return await this.updateAccount(params);
      case 'user':
        throw new BadRequestError('User update is not supported');
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async updateContact(params: ContactUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('person');
    // Their API is a PUT, but the behavior is more akin to a PATCH.
    const response = await axios.put<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/persons/${params.id}`,
      toPipedrivePersonUpdateParams(params, fields),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async updateLead(params: LeadUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('lead');
    const response = await axios.patch<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/leads/${params.id}`,
      toPipedriveLeadUpdateParams(params, fields),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async updateAccount(params: AccountUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('organization');
    // Their API is a PUT, but the behavior is more akin to a PATCH.
    const response = await axios.put<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/organizations/${params.id}`,
      toPipedriveOrganizationUpdateParams(params, fields),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async updateOpportunity(params: OpportunityUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const fields = await this.#getCustomFieldsForObject('deal');
    // Their API is a PUT, but the behavior is more akin to a PATCH.
    const response = await axios.put<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/deals/${params.id}`,
      toPipedriveDealUpdateParams(params, pipelineStageMapping, fields),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }

  public override async handleErr(err: unknown): Promise<unknown> {
    if (!(err instanceof AxiosError)) {
      return err;
    }

    // https://pipedrive.readme.io/docs/core-api-concepts-responses#error-response
    const jsonErrorMessage = err.response?.data?.error;
    if (jsonErrorMessage?.includes('invalid_grant')) {
      return new SGConnectionNoLongerAuthenticatedError(jsonErrorMessage, err.response?.data);
    }
    const cause = err.response?.data;
    const status = err.response?.status;

    switch (status) {
      case 400:
        return new InternalServerError(jsonErrorMessage, { cause, origin: 'remote-provider', status });
      case 401:
        return new UnauthorizedError(jsonErrorMessage, { cause, origin: 'remote-provider', status });
      case 403:
        return new ForbiddenError(jsonErrorMessage, { cause, origin: 'remote-provider', status });
      case 404:
        return new NotFoundError(jsonErrorMessage, { cause, origin: 'remote-provider', status });
      case 429:
        return new TooManyRequestsError(jsonErrorMessage, { cause, origin: 'remote-provider', status });
      // The following are unmapped to Supaglue errors, but we want to pass
      // them back as 4xx so they aren't 500 and developers can view error messages
      case 402:
      case 405:
      case 406:
      case 407:
      case 408:
      case 409:
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
        return new RemoteProviderError(jsonErrorMessage, { cause, status });
      default:
        return err;
    }
  }
}

export function newClient(connection: ConnectionUnsafe<'pipedrive'>, provider: Provider): PipedriveClient {
  return new PipedriveClient({
    ...connection.credentials,
    instanceUrl: connection.instanceUrl,
    clientId: (provider as CRMProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as CRMProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://oauth.pipedrive.com',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://oauth.pipedrive.com',
  authorizePath: '/oauth/authorize',
};

function filterForUpdatedAfter<
  R extends {
    data: { update_time?: string }[] | null;
  },
>(response: R, updatedAfter?: Date): R {
  if (!response.data?.length) {
    return response;
  }
  return {
    ...response,
    data: response.data?.filter((record) => {
      if (!updatedAfter) {
        return true;
      }

      if (!record.update_time) {
        return true;
      }

      return updatedAfter < new Date(record.update_time);
    }),
  };
}
