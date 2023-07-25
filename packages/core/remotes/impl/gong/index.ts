import type { ConnectionUnsafe, EngagementOauthProvider, ObjectRecord, Provider } from '@supaglue/types';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import axios from 'axios';
import { Readable } from 'stream';
import { REFRESH_TOKEN_THRESHOLD_MS, retryWhenAxiosRateLimited } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';
import { paginator } from '../../utils/paginator';
import { toGongStandardObject } from './mappers';

type GongPaginatedResponse<K extends string, R extends Record<string, unknown> = Record<string, unknown>> = {
  requestId: string;
  records: {
    totalRecords: number;
    currentPageSize: number;
    currentPageNumber: number;
    cursor?: string;
  };
} & Record<K, R[]>;

type GongCall = {
  id: string;
  started: string; // ISO string
  // ... other fields that aren't needed in ObjectRecord
};

type GongDetailedCall = {
  metaData: {
    id: string;
    started: string; // ISO string
  };
  // ... other fields that aren't needed in ObjectRecord
};

type GongCallTranscript = {
  callId: string;
  // ... other fields that aren't needed in ObjectRecord
};

type GongClientConfig = GongOAuthClientConfig | GongAccessKeySecretClientConfig;

type GongOAuthClientConfig = {
  type: 'oauth2';
  instanceUrl: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
};

type GongAccessKeySecretClientConfig = {
  type: 'access_key_secret';
  accessKey: string;
  accessKeySecret: string;
};

class GongClient extends AbstractEngagementRemoteClient {
  readonly #config: GongClientConfig;

  public constructor(config: GongClientConfig) {
    super(config.type === 'oauth2' ? config.instanceUrl : 'https://api.gong.io');
    this.#config = config;
  }

  getAuthHeaders(): Record<string, string> {
    if (this.#config.type === 'oauth2') {
      return {
        Authorization: `Bearer ${this.#config.accessToken}`,
      };
    }
    return {
      Authorization: `Basic ${Buffer.from(`${this.#config.accessKey}:${this.#config.accessKeySecret}`).toString(
        'base64'
      )}`,
    };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.getAuthHeaders();
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (this.#config.type !== 'oauth2') {
      return;
    }
    if (!this.#config.expiresAt || Date.parse(this.#config.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS) {
      const { data } = await axios.post<{ access_token: string; refresh_token: string; expires_in: number }>(
        `${authConfig.tokenHost}${authConfig.tokenPath}`,
        null,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.#config.clientId}:${this.#config.clientSecret}`).toString(
              'base64'
            )}`,
          },
          params: {
            grant_type: 'refresh_token',
            refresh_token: this.#config.refreshToken,
          },
        }
      );

      const { access_token, refresh_token, expires_in } = data;

      const newExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
      this.#config.accessToken = access_token;
      this.#config.refreshToken = refresh_token;
      this.#config.expiresAt = newExpiresAt;
      this.emit('token_refreshed', {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: newExpiresAt,
      });
    }
  }

  public override async listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date | undefined,
    heartbeat?: (() => void) | undefined
  ): Promise<Readable> {
    const validatedObject = toGongStandardObject(object);

    // TODO: Need to create stream with id
    switch (validatedObject) {
      case 'call': {
        return await this.#getPaginatorByGet<'calls', GongCall>(
          'v2/calls',
          'calls',
          (call, emittedAt) => ({
            id: call.id,
            rawData: call,
            mappedData: null,
            isDeleted: false,
            lastModifiedAt: new Date(call.started),
            emittedAt,
          }),
          modifiedAfter
        );
      }
      case 'detailedCall': {
        return await this.#getPaginatorByPost<'calls', GongDetailedCall>(
          'v2/calls/extensive',
          'calls',
          (detailedCall, emittedAt) => ({
            id: detailedCall.metaData.id,
            rawData: detailedCall,
            mappedData: null,
            isDeleted: false,
            lastModifiedAt: new Date(detailedCall.metaData.started),
            emittedAt,
          }),
          modifiedAfter
        );
      }
      case 'callTranscript': {
        return await this.#getPaginatorByPost<'callTranscripts', GongCallTranscript>(
          'v2/calls/transcript',
          'callTranscripts',
          (transcript, emittedAt) => ({
            id: transcript.callId,
            rawData: transcript,
            mappedData: null,
            isDeleted: false,
            // we don't know the last modified at time
            // TODO: figure out some way to address this.
            // Otherwise, we're just going to be constantly doing full refresh for transcripts.
            // Maybe there is some way to get the max last modified at time for the 'calls' sync
            // and use that?
            lastModifiedAt: new Date(0),
            emittedAt,
          }),
          modifiedAfter
        );
      }
      default:
        throw new Error(`Unsupported object: ${object}`);
    }
  }

  #getPaginatorByGet<K extends string, R extends Record<string, unknown>>(
    path: string,
    key: K,
    mapper: (record: R, emittedAt: Date) => ObjectRecord<R>,
    modifiedAfter?: Date
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.#getPageFetcherByGet<K, R>(path, modifiedAfter),
        createStreamFromPage: ({ [key]: records }) => {
          const emittedAt = new Date();
          return Readable.from(records.map((record) => mapper(record, emittedAt)));
        },
        getNextCursorFromPage: ({ records }) => records.cursor,
      },
    ]);
  }

  #getPaginatorByPost<K extends string, R extends Record<string, unknown>>(
    path: string,
    key: K,
    mapper: (record: R, emittedAt: Date) => ObjectRecord<R>,
    modifiedAfter?: Date
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.#getPageFetcherByPost<K, R>(path, modifiedAfter),
        createStreamFromPage: ({ [key]: records }) => {
          const emittedAt = new Date();
          return Readable.from(records.map((record) => mapper(record, emittedAt)));
        },
        getNextCursorFromPage: ({ records }) => records.cursor,
      },
    ]);
  }

  #getPageFetcherByGet<K extends string, R extends Record<string, unknown>>(
    path: string,
    modifiedAfter?: Date
  ): (cursor?: string) => Promise<GongPaginatedResponse<K, R>> {
    return async (cursor?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        const { data } = await axios.get<GongPaginatedResponse<K, R>>(`${this.baseUrl}/${path}`, {
          headers: this.getAuthHeaders(),
          params: {
            cursor,
            fromDateTime: modifiedAfter?.toISOString(),
          },
        });

        return data;
      });
    };
  }

  #getPageFetcherByPost<K extends string, R extends Record<string, unknown>>(
    path: string,
    modifiedAfter?: Date
  ): (cursor?: string) => Promise<GongPaginatedResponse<K, R>> {
    return async (cursor?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        const { data } = await axios.post<GongPaginatedResponse<K, R>>(
          `${this.baseUrl}/${path}`,
          {
            cursor,
            filter: {
              fromDateTime: modifiedAfter?.toISOString(),
            },
          },
          {
            headers: this.getAuthHeaders(),
          }
        );

        return data;
      });
    };
  }
}

export function newClient(connection: ConnectionUnsafe<'gong'>, provider: Provider): GongClient {
  if (connection.credentials.type === 'access_key_secret') {
    return new GongClient({
      type: 'access_key_secret',
      accessKey: connection.credentials.accessKey,
      accessKeySecret: connection.credentials.accessKeySecret,
    });
  }
  return new GongClient({
    type: 'oauth2',
    instanceUrl: connection.instanceUrl,
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    expiresAt: connection.credentials.expiresAt,
    clientId: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://app.gong.io',
  tokenPath: '/oauth2/generate-customer-token',
  authorizeHost: 'https://app.gong.io',
  authorizePath: '/oauth2/authorize',
};
