import axios from '@supaglue/core/remotes/sg_axios';
import type { ConnectionUnsafe, EngagementOauthProvider, ListedObjectRecord, Provider } from '@supaglue/types';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import { Readable } from 'stream';
import { REFRESH_TOKEN_THRESHOLD_MS, retryWhenAxiosRateLimited } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractNoCategoryRemoteClient } from '../../categories/no_category/base';
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

class GongClient extends AbstractNoCategoryRemoteClient {
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
    fieldsToFetch: FieldsToFetch,
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
          (call, emittedAt) => {
            const ret: ListedObjectRecord<GongCall> = {
              id: call.id,
              rawData: call,
              rawProperties: call,
              isDeleted: false,
              lastModifiedAt: new Date(call.started),
              emittedAt,
            };
            return ret;
          },
          modifiedAfter
        );
      }
      case 'detailedCall': {
        return await this.#getPaginatorByPost<'calls', GongDetailedCall>(
          'v2/calls/extensive',
          'calls',
          (detailedCall, emittedAt) => {
            const ret: ListedObjectRecord<GongDetailedCall> = {
              id: detailedCall.metaData.id,
              rawData: detailedCall,
              rawProperties: detailedCall,
              isDeleted: false,
              lastModifiedAt: new Date(detailedCall.metaData.started),
              emittedAt,
            };
            return ret;
          },
          modifiedAfter
        );
      }
      case 'callTranscript': {
        return await this.#getPaginatorByPost<'callTranscripts', GongCallTranscript>(
          'v2/calls/transcript',
          'callTranscripts',
          (transcript, emittedAt) => {
            const ret: ListedObjectRecord<GongCallTranscript> = {
              id: transcript.callId,
              rawData: transcript,
              rawProperties: transcript,
              isDeleted: false,
              // we don't know the last modified at time
              // TODO: figure out some way to address this.
              // Otherwise, we're just going to be constantly doing full refresh for transcripts.
              // Maybe there is some way to get the max last modified at time for the 'calls' sync
              // and use that?
              lastModifiedAt: new Date(0),
              emittedAt,
            };
            return ret;
          },
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
    mapper: (record: R, emittedAt: Date) => ListedObjectRecord<R>,
    modifiedAfter?: Date
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.#getPageFetcherByGet<K, R>(key, path, modifiedAfter),
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
    mapper: (record: R, emittedAt: Date) => ListedObjectRecord<R>,
    modifiedAfter?: Date
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.#getPageFetcherByPost<K, R>(key, path, modifiedAfter),
        createStreamFromPage: ({ [key]: records }) => {
          const emittedAt = new Date();
          return Readable.from(records.map((record) => mapper(record, emittedAt)));
        },
        getNextCursorFromPage: ({ records }) => records.cursor,
      },
    ]);
  }

  #getPageFetcherByGet<K extends string, R extends Record<string, unknown>>(
    key: K,
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
          validateStatus: (status) => status === 200 || status === 404,
        });

        // Gong returns a 404 when there are no records. We want to return a GongPaginatedResponse with no cursor and empty [key] records
        data.records = data.records ?? {
          totalRecords: 0,
          currentPageSize: 0,
          currentPageNumber: 0,
        };
        data[key] = data[key] ?? [];

        return data;
      });
    };
  }

  #getPageFetcherByPost<K extends string, R extends Record<string, unknown>>(
    key: K,
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
            validateStatus: (status) => status === 200 || status === 404,
          }
        );

        // Gong returns a 404 when there are no records. We want to return a GongPaginatedResponse with no cursor and empty [key] records
        data.records = data.records ?? {
          totalRecords: 0,
          currentPageSize: 0,
          currentPageNumber: 0,
        };
        data[key] = data[key] ?? [];

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
