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
import { fromPipedrivePersonToRemoteContact } from './mappers';

const PIPEDRIVE_RECORD_LIMIT = 500;

const DEFAULT_LIST_PARAMS = {
  limit: PIPEDRIVE_RECORD_LIMIT,
  sort: 'id',
};

export type PipedriveRecord = Record<string, any>;

type PipedrivePaginatedRecords = {
  success: boolean;
  data: PipedriveRecord[];
  additional_data: {
    pagination: {
      start: number;
      limit: number;
      more_items_in_collection: boolean;
      next_start: number;
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
      default:
        return Readable.from([]);
    }
  }

  #getListRecordsFetcher(endpoint: string): (next_start?: string) => Promise<PipedrivePaginatedRecords> {
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
      return response.data;
    };
  }

  private async listContacts(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#credentials.instanceUrl}/api/v1/persons`);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.data.map(fromPipedrivePersonToRemoteContact)),
        getNextCursorFromPage: (response) => response.additional_data.pagination.next_start?.toString(),
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
