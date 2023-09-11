import type {
  ConnectionUnsafe,
  ListedObjectRecord,
  NoCategoryProvider,
  Provider,
  RemoteUserIdAndDetails,
} from '@supaglue/types';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import axios from 'axios';
import { Readable } from 'stream';
import { retryWhenAxiosRateLimited } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractNoCategoryRemoteClient } from '../../categories/no_category/base';
import { paginator } from '../../utils/paginator';
import { toIntercomStandardObject } from './mappers';

const PAGINATION_LIMIT = 50;

type IntercomRecord = {
  id: string;
  updated_at?: number;
};

type IntercomPaginatedSearchResponse<K extends string> = {
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
} & Record<K, IntercomRecord[]>;

type IntercomPaginatedNormalResponse<K extends string> = {
  pages?: {
    type: 'pages';
    next?: string;
    page: number;
    per_page: number;
    total_pages: number;
  };
} & Record<K, IntercomRecord[]>;

// empirical behavior differs from actual response
// https://developers.intercom.com/docs/references/rest-api/api.intercom.io/Companies/scrollOverAllCompanies/
type IntercomPaginatedScrollResponse = IntercomPaginatedNormalResponse<'data'>;

type IntercomClientConfig = {
  accessToken: string;
  clientId: string;
  clientSecret: string;
};

type IntercomMeResponse = {
  id: string;
  [key: string]: unknown;
};

class IntercomClient extends AbstractNoCategoryRemoteClient {
  readonly #config: IntercomClientConfig;
  public constructor(config: IntercomClientConfig) {
    super('https://api.intercom.io');
    this.#config = config;
  }

  public override async getUserIdAndDetails(): Promise<RemoteUserIdAndDetails> {
    const response = await axios.get<IntercomMeResponse>(`${this.baseUrl}/me`, {
      headers: this.#getAuthHeaders(),
    });
    return { userId: String(response.data.id), rawDetails: response.data };
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

  #getSearchPaginatedListFetcher<K extends string>(
    path: string,
    modifiedAfter?: Date
  ): (cursor?: string) => Promise<IntercomPaginatedSearchResponse<K>> {
    return async (cursor?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        const { data } = await axios.post<IntercomPaginatedSearchResponse<K>>(
          `${this.baseUrl}/${path}`,
          {
            query: {
              operator: '>',
              field: 'updated_at',
              value: (modifiedAfter?.getTime() ?? 0) / 1000,
            },
            pagination: cursor ? { starting_after: cursor } : null,
          },
          {
            headers: this.#getAuthHeaders(),
          }
        );
        return data;
      });
    };
  }

  #getNormalPaginatedListFetcher<K extends string>(
    path: string
  ): (cursor?: string) => Promise<IntercomPaginatedNormalResponse<K>> {
    return async (cursor?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        const { data } = await axios.get<IntercomPaginatedNormalResponse<K>>(`${this.baseUrl}/${path}`, {
          headers: this.#getAuthHeaders(),
          params: {
            per_page: PAGINATION_LIMIT,
            starting_after: cursor,
          },
        });

        return data;
      });
    };
  }

  #getScrollPaginatedListFetcher(path: string): (cursor?: string) => Promise<IntercomPaginatedScrollResponse> {
    return async (cursor?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        const { data } = await axios.get<IntercomPaginatedScrollResponse>(cursor ?? `${this.baseUrl}/${path}`, {
          headers: this.#getAuthHeaders(),
          params: {
            per_page: PAGINATION_LIMIT,
          },
        });

        return data;
      });
    };
  }

  #getSearchPaginator<K extends string>(
    path: string,
    key: K,
    mapper: (record: IntercomRecord, emittedAt: Date) => ListedObjectRecord<IntercomRecord>,
    modifiedAfter?: Date
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.#getSearchPaginatedListFetcher<K>(path, modifiedAfter),
        createStreamFromPage: ({ [key]: records }) => {
          const emittedAt = new Date();
          return Readable.from(records.map((record) => mapper(record, emittedAt)));
        },
        getNextCursorFromPage: (response) => response.pages?.next?.starting_after,
      },
    ]);
  }

  #getNormalPaginator<K extends string>(
    path: string,
    key: K,
    mapper: (record: IntercomRecord, emittedAt: Date) => ListedObjectRecord<IntercomRecord>
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.#getNormalPaginatedListFetcher<K>(path),
        createStreamFromPage: ({ [key]: records }) => {
          const emittedAt = new Date();
          return Readable.from(records.map((record) => mapper(record, emittedAt)));
        },
        getNextCursorFromPage: (response) => response.pages?.next,
      },
    ]);
  }

  #getScrollPaginator(
    path: string,
    mapper: (record: IntercomRecord, emittedAt: Date) => ListedObjectRecord<IntercomRecord>
  ): Promise<Readable> {
    // documentation says GET /companies/scroll uses scroll_param, but the actual response doesn't have it
    // https://developers.intercom.com/docs/references/rest-api/api.intercom.io/Companies/scrollOverAllCompanies/
    return paginator([
      {
        pageFetcher: this.#getScrollPaginatedListFetcher(path),
        createStreamFromPage: ({ data: records }) => {
          const emittedAt = new Date();
          return Readable.from(records.map((record) => mapper(record, emittedAt)));
        },
        getNextCursorFromPage: (response) => response.pages?.next,
      },
    ]);
  }

  public override async listStandardObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date | undefined,
    heartbeat?: (() => void) | undefined
  ): Promise<Readable> {
    const validatedObject = toIntercomStandardObject(object);

    switch (validatedObject) {
      case 'contact':
        return await this.#getSearchPaginator<'data'>(
          'contacts/search',
          'data',
          (record, emittedAt) => {
            const ret: ListedObjectRecord<IntercomRecord> = {
              id: record.id,
              rawData: record,
              rawProperties: record,
              isDeleted: false,
              lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
              emittedAt,
            };
            return ret;
          },
          modifiedAfter
        );
      case 'conversation':
        return await this.#getSearchPaginator<'conversations'>(
          'conversations/search',
          'conversations',
          (record, emittedAt) => {
            const ret: ListedObjectRecord<IntercomRecord> = {
              id: record.id,
              rawData: record,
              rawProperties: record,
              isDeleted: false,
              lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
              emittedAt,
            };
            return ret;
          },
          modifiedAfter
        );
      case 'admin':
        return await this.#getNormalPaginator('admins', 'admins', (record, emittedAt) => {
          const ret: ListedObjectRecord<IntercomRecord> = {
            id: record.id,
            rawData: record,
            rawProperties: record,
            isDeleted: false,
            lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
            emittedAt,
          };
          return ret;
        });
      case 'article':
        return await this.#getNormalPaginator('articles', 'data', (record, emittedAt) => {
          const ret: ListedObjectRecord<IntercomRecord> = {
            id: record.id,
            rawData: record,
            rawProperties: record,
            isDeleted: false,
            lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
            emittedAt,
          };
          return ret;
        });
      case 'company':
        return await this.#getScrollPaginator('companies', (record, emittedAt) => {
          const ret: ListedObjectRecord<IntercomRecord> = {
            id: record.id,
            rawData: record,
            rawProperties: record,
            isDeleted: false,
            lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
            emittedAt,
          };
          return ret;
        });
    }
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
