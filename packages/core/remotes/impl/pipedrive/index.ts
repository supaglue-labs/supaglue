import type {
  ConnectionUnsafe,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
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
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import axios, { AxiosError } from 'axios';
import { Readable } from 'stream';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../errors';
import { REFRESH_TOKEN_THRESHOLD_MS, retryWhenAxiosRateLimited } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';
import { paginator } from '../../utils/paginator';
import {
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
  readonly #headers: Record<string, string>;
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
      const response = await axios.post<{ access_token: string; expires_in: number }>(
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
      const newExpiresAt = new Date(Date.now() + response.data.expires_in * 1000).toISOString();

      this.#credentials.accessToken = newAccessToken;
      this.#credentials.expiresAt = newExpiresAt;

      this.emit('token_refreshed', newAccessToken, newExpiresAt);
    }
  }

  public override async listCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'contact':
        return await this.listContacts(updatedAfter);
      case 'lead':
        return await this.listLeads(updatedAfter);
      case 'opportunity':
        return await this.listOpportunities(updatedAfter);
      case 'account':
        return await this.listAccounts(updatedAfter);
      case 'user':
        return await this.listUsers(updatedAfter);
      default:
        return Readable.from([]);
    }
  }

  #getListRecordsFetcher(
    endpoint: string,
    updatedAfter?: Date
  ): (next_start?: string) => Promise<PipedrivePaginatedRecords> {
    // Pipedrive does not support incremental fetch (i.e. filtering by datetime) so we will do full refresh every time
    return async (next_start?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        if (next_start) {
          const response = await axios.get<PipedrivePaginatedRecords>(endpoint, {
            params: {
              ...DEFAULT_LIST_PARAMS,
              start: parseInt(next_start),
            },
            headers: this.#headers,
          });
          return response.data;
        }
        const response = await axios.get<PipedrivePaginatedRecords>(endpoint, {
          params: DEFAULT_LIST_PARAMS,
          headers: this.#headers,
        });
        return filterForUpdatedAfter(response.data, updatedAfter);
      });
    };
  }

  private async listContacts(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/persons`,
      updatedAfter
    );
    const fields = await this.#getCustomFieldsForObject('person');
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              record: fromPipedrivePersonToContact(result, fields),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  private async listLeads(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/leads`,
      updatedAfter
    );
    const fields = await this.#getCustomFieldsForObject('lead');
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              record: fromPipedriveLeadToLead(result, fields),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
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

  private async listOpportunities(updatedAfter?: Date): Promise<Readable> {
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/deals`,
      updatedAfter
    );
    const fields = await this.#getCustomFieldsForObject('deal');
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((record) => ({
              record: fromPipedriveDealToOpportunity(record, pipelineStageMapping, fields),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  private async listAccounts(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/organizations`,
      updatedAfter
    );
    const fields = await this.#getCustomFieldsForObject('organization');
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              record: fromPipedriveOrganizationToAccount(result, fields),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  private async listUsers(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(
      `${this.#credentials.instanceUrl}/api/v1/users`,
      updatedAfter
    );
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              record: fromPipedriveUserToUser(result),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  public override async getCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    id: string,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    switch (commonObjectType) {
      case 'contact':
        return await this.getContact(id);
      case 'lead':
        return await this.getLead(id);
      case 'opportunity':
        return await this.getOpportunity(id);
      case 'account':
        return await this.getAccount(id);
      case 'user':
        return await this.getUser(id);
      default:
        throw new Error(`Common object ${commonObjectType} not supported`);
    }
  }

  async getContact(id: string): Promise<Contact> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('person');
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/persons/${id}`, {
      headers: this.#headers,
    });
    return fromPipedrivePersonToContact(response.data.data, fields);
  }

  async getLead(id: string): Promise<Lead> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('lead');
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/leads/${id}`, {
      headers: this.#headers,
    });
    return fromPipedriveLeadToLead(response.data.data, fields);
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('deal');
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/deals/${id}`, {
      headers: this.#headers,
    });
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    return fromPipedriveDealToOpportunity(response.data.data, pipelineStageMapping, fields);
  }

  async getAccount(id: string): Promise<Account> {
    await this.maybeRefreshAccessToken();
    const fields = await this.#getCustomFieldsForObject('organization');
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/organizations/${id}`, {
      headers: this.#headers,
    });
    return fromPipedriveOrganizationToAccount(response.data.data, fields);
  }

  async getUser(id: string): Promise<User> {
    await this.maybeRefreshAccessToken();
    const response = await axios.get<PipedriveRecord>(`${this.#credentials.instanceUrl}/api/v1/users/${id}`, {
      headers: this.#headers,
    });
    return fromPipedriveUserToUser(response.data.data);
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
        throw new Error('User creation is not supported');
      default:
        throw new Error(`Common object ${commonObjectType} not supported`);
    }
  }

  async #getCustomFieldsForObject(object: PipedriveObjectSupportingCustomFields): Promise<PipedriveObjectField[]> {
    function getFieldsPrefix(): string {
      switch (object) {
        case 'person':
        case 'organization':
        case 'deal':
          return object;
        case 'lead':
          return 'deal';
      }
    }

    await this.maybeRefreshAccessToken();
    // TODO: Handle pagination. We're assuming that by not passing in a limit param, we get all the fields.
    // This may be an incorrect assumption
    const response = await axios.get<PipedriveObjectFieldsResponse>(
      `${this.#credentials.instanceUrl}/api/v1/${getFieldsPrefix()}Fields:(key,name,edit_flag,field_type,options)`,
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
        throw new Error('User update is not supported');
      default:
        throw new Error(`Common object ${commonObjectType} not supported`);
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
    const fields = await this.#getCustomFieldsForObject('person');
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
    const fields = await this.#getCustomFieldsForObject('person');
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
    const fields = await this.#getCustomFieldsForObject('person');
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

  public override handleErr(err: unknown): unknown {
    if (!(err instanceof AxiosError)) {
      return err;
    }

    const jsonErrorMessage = err.response?.data?.data?.message;

    switch (err.response?.status) {
      case 400:
        return new BadRequestError(jsonErrorMessage ?? err.message);
      case 401:
        return new UnauthorizedError(jsonErrorMessage ?? err.message);
      case 403:
        return new ForbiddenError(jsonErrorMessage ?? err.message);
      case 404:
        return new NotFoundError(jsonErrorMessage ?? err.message);
      case 429:
        return new TooManyRequestsError(jsonErrorMessage ?? err.message);
      default:
        return err;
    }
  }
}

export function newClient(connection: ConnectionUnsafe<'pipedrive'>, provider: Provider): PipedriveClient {
  return new PipedriveClient({
    ...connection.credentials,
    instanceUrl: connection.instanceUrl,
    clientId: provider.config.oauth.credentials.oauthClientId,
    clientSecret: provider.config.oauth.credentials.oauthClientSecret,
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
    data: { updated_time?: string }[] | null;
  }
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

      if (!record.updated_time) {
        return true;
      }

      return updatedAfter < new Date(record.updated_time);
    }),
  };
}
