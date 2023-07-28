import type { ConnectionUnsafe, NoCategoryProvider, Provider } from '@supaglue/types';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import axios from 'axios';
import { Readable } from 'stream';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractNoCategoryRemoteClient } from '../../categories/no_category/base';
import { paginator } from '../../utils/paginator';
import { toIntercomEndpoint, toIntercomStandardObject } from './mappers';

const PAGINATION_LIMIT = 50;

type IntercomPaginatedRecords = {
  pages?: {
    next?: {
      page: number;
      starting_after: string;
    };
    type: 'pages';
    page: number;
    per_page: number;
    total_pages: number;
  };
  total_count: number;
  data: Record<string, unknown>[];
};

type IntercomClientConfig = {
  accessToken: string;
  clientId: string;
  clientSecret: string;
};

class IntercomClient extends AbstractNoCategoryRemoteClient {
  readonly #config: IntercomClientConfig;
  public constructor(config: IntercomClientConfig) {
    super('https://api.intercom.io');
    this.#config = config;
  }

  #getAuthHeaders(): Record<string, string> {
    return {
      'Intercom-Version': '2.9',
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${this.#config.accessToken}`,
    };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.#getAuthHeaders();
  }

  #getPaginatedListFetcherForEndpoint(
    endpoint: string,
    pageSize = PAGINATION_LIMIT
  ): (cursor?: string) => Promise<IntercomPaginatedRecords> {
    return async (cursor?: string): Promise<IntercomPaginatedRecords> => {
      const { data } = await axios.get<IntercomPaginatedRecords>(endpoint, {
        headers: this.#getAuthHeaders(),
        params: {
          per_page: pageSize,
          starting_after: cursor,
        },
      });
      return data;
    };
  }

  #getPaginatedSearchFetcherForEndpoint(
    endpoint: string,
    modifiedAfter?: Date,
    pageSize = PAGINATION_LIMIT
  ): (cursor?: string) => Promise<IntercomPaginatedRecords> {
    return async (cursor?: string): Promise<IntercomPaginatedRecords> => {
      const { data } = await axios.post<IntercomPaginatedRecords>(
        endpoint,
        {
          query: {
            operator: '>',
            field: 'updated_at',
            value: (modifiedAfter?.getTime() ?? 0) / 1000,
          },
        },
        {
          headers: this.#getAuthHeaders(),
          params: {
            per_page: pageSize,
            starting_after: cursor,
          },
        }
      );
      return data;
    };
  }

  public override async listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date | undefined,
    heartbeat?: (() => void) | undefined
  ): Promise<Readable> {
    const validatedObject = toIntercomStandardObject(object);

    const pageFetcher = () => {
      switch (validatedObject) {
        case 'contact':
        case 'conversation':
          return this.#getPaginatedSearchFetcherForEndpoint(
            `${toIntercomEndpoint(validatedObject)}/search`,
            modifiedAfter
          );
        default:
          return this.#getPaginatedListFetcherForEndpoint(toIntercomEndpoint(validatedObject));
      }
    };

    return paginator([
      {
        pageFetcher: pageFetcher(),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((record) => ({
              id: record.id,
              rawData: record,
              mappedData: record,
              mappedProperties: record,
              isDeleted: false,
              lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : undefined,
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.pages?.next?.starting_after,
      },
    ]);
  }
}

export function newClient(connection: ConnectionUnsafe<'intercom'>, provider: Provider): IntercomClient {
  return new IntercomClient({
    // Note: Intercom access tokens never expire.
    accessToken: connection.credentials.accessToken,
    clientId: (provider as NoCategoryProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as NoCategoryProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.intercom.io',
  tokenPath: '/auth/eagle/token',
  authorizeHost: 'https://app.intercom.io',
  authorizePath: '/oauth',
};
