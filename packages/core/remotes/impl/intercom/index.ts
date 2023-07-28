import type { ConnectionUnsafe, NoCategoryProvider, ObjectRecord, Provider } from '@supaglue/types';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
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

type IntercomPaginatedResponse<K extends string> = {
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

  #getPaginatedListFetcher<K extends string>(
    path: string,
    modifiedAfter?: Date
  ): (cursor?: string) => Promise<IntercomPaginatedResponse<K>> {
    const isSearch = path.includes('search');
    return async (cursor?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        if (!isSearch) {
          const { data } = await axios.get<IntercomPaginatedResponse<K>>(`${this.baseUrl}/${path}`, {
            headers: this.#getAuthHeaders(),
            params: {
              per_page: PAGINATION_LIMIT,
              starting_after: cursor,
            },
          });

          return data;
        }
        const { data } = await axios.post<IntercomPaginatedResponse<K>>(
          `${this.baseUrl}/${path}`,
          {
            query: {
              operator: '>',
              field: 'updated_at',
              value: (modifiedAfter?.getTime() ?? 0) / 1000,
            },
            pagination: {
              starting_after: cursor,
            },
          },
          {
            headers: this.#getAuthHeaders(),
          }
        );
        return data;
      });
    };
  }

  #getPaginator<K extends string>(
    path: string,
    key: K,
    mapper: (record: IntercomRecord, emittedAt: Date) => ObjectRecord<IntercomRecord>,
    modifiedAfter?: Date
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.#getPaginatedListFetcher<K>(path, modifiedAfter),
        createStreamFromPage: ({ [key]: records }) => {
          const emittedAt = new Date();
          return Readable.from(records.map((record) => mapper(record, emittedAt)));
        },
        getNextCursorFromPage: (response) => response.pages?.next?.starting_after,
      },
    ]);
  }

  public override async listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date | undefined,
    heartbeat?: (() => void) | undefined
  ): Promise<Readable> {
    const validatedObject = toIntercomStandardObject(object);

    switch (validatedObject) {
      case 'contact':
        return await this.#getPaginator<'data'>(
          'contacts/search',
          'data',
          (record, emittedAt) => ({
            id: record.id,
            rawData: record,
            mappedData: record,
            isDeleted: false,
            lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
            emittedAt,
          }),
          modifiedAfter
        );
      case 'conversation':
        return await this.#getPaginator<'conversations'>(
          'conversations/search',
          'conversations',
          (record, emittedAt) => ({
            id: record.id,
            rawData: record,
            mappedData: record,
            isDeleted: false,
            lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
            emittedAt,
          }),
          modifiedAfter
        );
      case 'admin':
        return await this.#getPaginator<'admins'>(
          'admins',
          'admins',
          (record, emittedAt) => ({
            id: record.id,
            rawData: record,
            mappedData: record,
            isDeleted: false,
            lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
            emittedAt,
          }),
          modifiedAfter
        );
      case 'article':
        return await this.#getPaginator<'data'>(
          'articles',
          'data',
          (record, emittedAt) => ({
            id: record.id,
            rawData: record,
            mappedData: record,
            isDeleted: false,
            lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
            emittedAt,
          }),
          modifiedAfter
        );
      case 'company':
        return await this.#getPaginator<'data'>(
          'companies',
          'data',
          (record, emittedAt) => ({
            id: record.id,
            rawData: record,
            mappedData: record,
            isDeleted: false,
            lastModifiedAt: record.updated_at ? new Date(record.updated_at as number) : new Date(0),
            emittedAt,
          }),
          modifiedAfter
        );
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
