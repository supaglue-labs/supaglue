import {
  ConnectionUnsafe,
  CRMIntegration,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import { CRMCommonModelType, CRMCommonModelTypeMap } from '@supaglue/types/crm';
import axios from 'axios';
import { Readable } from 'stream';
import { REFRESH_TOKEN_THRESHOLD_MS } from '../../../lib';
import { paginator } from '../../utils/paginator';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';
import {
  fromPipedriveDealToRemoteOpportunity,
  fromPipedriveLeadToRemoteLead,
  fromPipedriveOrganizationToRemoteAccount,
  fromPipedrivePersonToRemoteContact,
  fromPipedriveUserToRemoteUser,
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
  data: PipedriveRecord[];
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
        createStreamFromPage: (response) => Readable.from(response.data.map(fromPipedrivePersonToRemoteContact)),
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
        createStreamFromPage: (response) => Readable.from(response.data.map(fromPipedriveLeadToRemoteLead)),
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
        createStreamFromPage: (response) =>
          Readable.from(
            response.data.map((record) => fromPipedriveDealToRemoteOpportunity(record, pipelineStageMapping))
          ),
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
        createStreamFromPage: (response) => Readable.from(response.data.map(fromPipedriveOrganizationToRemoteAccount)),
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
        createStreamFromPage: (response) => Readable.from(response.data.map(fromPipedriveUserToRemoteUser)),
        getNextCursorFromPage: (response) => response.additional_data.pagination?.next_start?.toString(),
      },
    ]);
  }

  public override createObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }

  public override updateObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
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
    data: { updated_time?: string }[];
  }
>(response: R, updatedAfter?: Date): R {
  return {
    ...response,
    data: response.data.filter((record) => {
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
