import {
  ConnectionUnsafe,
  CRMIntegration,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import {
  AccountCreateParams,
  AccountUpdateParams,
  ContactCreateParams,
  ContactUpdateParams,
  CRMCommonModelType,
  CRMCommonModelTypeMap,
  LeadCreateParams,
  LeadUpdateParams,
  OpportunityCreateParams,
  OpportunityUpdateParams,
} from '@supaglue/types/crm';
import axios from 'axios';
import { Readable } from 'stream';
import { REFRESH_TOKEN_THRESHOLD_MS, retryWhenAxiosRateLimited } from '../../../lib';
import { paginator } from '../../utils/paginator';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';
import {
  fromPipedriveDealToOpportunityV2,
  fromPipedriveLeadToLeadV2,
  fromPipedriveOrganizationToAccountV2,
  fromPipedrivePersonToContactV2,
  fromPipedriveUserToUserV2,
  toPipedriveDealCreateParams,
  toPipedriveDealUpdateParams,
  toPipedriveLeadCreateParams,
  toPipedriveLeadUpdateParams,
  toPipedriveOrganizationCreateParams,
  toPipedriveOrganizationUpdateParams,
  toPipedrivePersonCreateParams,
  toPipedrivePersonUpdateParams,
} from './mappers';

const PIPEDRIVE_RECORD_LIMIT = 500;

const DEFAULT_LIST_PARAMS = {
  limit: PIPEDRIVE_RECORD_LIMIT,
  sort: 'id',
};

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

  public override async listObjects(commonModelType: CRMCommonModelType, updatedAfter?: Date): Promise<Readable> {
    switch (commonModelType) {
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
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              object: fromPipedrivePersonToContactV2(result),
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
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              object: fromPipedriveLeadToLeadV2(result),
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
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((record) => ({
              object: fromPipedriveDealToOpportunityV2(record, pipelineStageMapping),
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
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data?.map((result) => ({
              object: fromPipedriveOrganizationToAccountV2(result),
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
              object: fromPipedriveUserToUserV2(result),
              emittedAt,
            })) ?? []
          );
        },
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  public override async getObject<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    throw new Error('Not yet implemented');
  }

  public override async createObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    switch (commonModelType) {
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
        throw new Error(`Common model ${commonModelType} not supported`);
    }
  }

  async createContact(params: ContactCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/persons`,
      toPipedrivePersonCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async createLead(params: LeadCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/leads`,
      toPipedriveLeadCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async createAccount(params: AccountCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/organizations`,
      toPipedriveOrganizationCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async createOpportunity(params: OpportunityCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    const response = await axios.post<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/deals`,
      toPipedriveDealCreateParams(params, pipelineStageMapping),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  public override async updateObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<string> {
    switch (commonModelType) {
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
        throw new Error(`Common model ${commonModelType} not supported`);
    }
  }

  async updateContact(params: ContactUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    // Their API is a PUT, but the behavior is more akin to a PATCH.
    const response = await axios.put<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/persons/${params.id}`,
      toPipedrivePersonUpdateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async updateLead(params: LeadUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.patch<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/leads/${params.id}`,
      toPipedriveLeadUpdateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async updateAccount(params: AccountUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    // Their API is a PUT, but the behavior is more akin to a PATCH.
    const response = await axios.put<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/organizations/${params.id}`,
      toPipedriveOrganizationUpdateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async updateOpportunity(params: OpportunityUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const pipelineStageMapping = await this.#getPipelineStageMapping();
    // Their API is a PUT, but the behavior is more akin to a PATCH.
    const response = await axios.put<{ data: PipedriveRecord }>(
      `${this.#credentials.instanceUrl}/api/v1/deals/${params.id}`,
      toPipedriveDealUpdateParams(params, pipelineStageMapping),
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
}

export function newClient(connection: ConnectionUnsafe<'pipedrive'>, integration: CRMIntegration): PipedriveClient {
  return new PipedriveClient({
    ...connection.credentials,
    instanceUrl: connection.instanceUrl,
    clientId: integration.config.oauth.credentials.oauthClientId,
    clientSecret: integration.config.oauth.credentials.oauthClientSecret,
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
