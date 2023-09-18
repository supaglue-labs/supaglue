import type {
  ConnectionUnsafe,
  ListedObjectRecord,
  NoCategoryProvider,
  Property,
  Provider,
  RemoteUserIdAndDetails,
  StandardOrCustomObjectDef,
} from '@supaglue/types';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import axios from 'axios';
import { Readable } from 'stream';
import { BadRequestError } from '../../../errors';
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

type IntercomPaginatedScrollResponse = {
  scroll_param?: string;
  data: IntercomRecord[];
};

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

  public override async listProperties(object: StandardOrCustomObjectDef): Promise<Property[]> {
    if (object.type === 'custom') {
      throw new BadRequestError('Custom objects are not supported for intercom');
    }

    const validatedObject = toIntercomStandardObject(object.name);
    switch (validatedObject) {
      case 'company':
        return [
          {
            id: 'type',
            label: 'type',
            type: 'string',
          },
          {
            id: 'id',
            label: 'id',
            type: 'string',
          },
          {
            id: 'name',
            label: 'name',
            type: 'string',
          },
          {
            id: 'app_id',
            label: 'app_id',
            type: 'string',
          },
          {
            id: 'plan',
            label: 'plan',
            type: 'object',
          },
          {
            id: 'company_id',
            label: 'company_id',
            type: 'string',
          },
          {
            id: 'remote_created_at',
            label: 'remote_created_at',
            type: 'integer',
          },
          {
            id: 'created_at',
            label: 'created_at',
            type: 'integer',
          },
          {
            id: 'updated_at',
            label: 'updated_at',
            type: 'integer',
          },
          {
            id: 'last_request_at',
            label: 'last_request_at',
            type: 'integer',
          },
          {
            id: 'size',
            label: 'size',
            type: 'integer',
          },
          {
            id: 'website',
            label: 'website',
            type: 'string',
          },
          {
            id: 'industry',
            label: 'industry',
            type: 'string',
          },
          {
            id: 'monthly_spend',
            label: 'monthly_spend',
            type: 'number',
          },
          {
            id: 'session_count',
            label: 'session_count',
            type: 'integer',
          },
          {
            id: 'user_count',
            label: 'user_count',
            type: 'integer',
          },
          {
            id: 'custom_attributes',
            label: 'custom_attributes',
            type: 'object',
          },
          {
            id: 'tags',
            label: 'tags',
            type: 'object',
          },
          {
            id: 'segments',
            label: 'segments',
            type: 'object',
          },
        ];
      case 'contact':
        return [
          {
            id: 'type',
            label: 'type',
            type: 'string',
          },
          {
            id: 'id',
            label: 'id',
            type: 'string',
          },
          {
            id: 'external_id',
            label: 'external_id',
            type: 'string',
          },
          {
            id: 'workspace_id',
            label: 'workspace_id',
            type: 'string',
          },
          {
            id: 'role',
            label: 'role',
            type: 'string',
          },
          {
            id: 'email',
            label: 'email',
            type: 'string',
          },
          {
            id: 'phone',
            label: 'phone',
            type: 'string',
          },
          {
            id: 'formatted_phone',
            label: 'formatted_phone',
            type: 'string',
          },
          {
            id: 'name',
            label: 'name',
            type: 'string',
          },
          {
            id: 'owner_id',
            label: 'owner_id',
            type: 'integer',
          },
          {
            id: 'has_hard_bounced',
            label: 'has_hard_bounced',
            type: 'boolean',
          },
          {
            id: 'marked_email_as_spam',
            label: 'marked_email_as_spam',
            type: 'boolean',
          },
          {
            id: 'unsubscribed_from_emails',
            label: 'unsubscribed_from_emails',
            type: 'boolean',
          },
          {
            id: 'created_at',
            label: 'created_at',
            type: 'integer',
          },
          {
            id: 'updated_at',
            label: 'updated_at',
            type: 'integer',
          },
          {
            id: 'signed_up_at',
            label: 'signed_up_at',
            type: 'integer',
          },
          {
            id: 'last_seen_at',
            label: 'last_seen_at',
            type: 'integer',
          },
          {
            id: 'last_replied_at',
            label: 'last_replied_at',
            type: 'integer',
          },
          {
            id: 'last_contacted_at',
            label: 'last_contacted_at',
            type: 'integer',
          },
          {
            id: 'last_email_opened_at',
            label: 'last_email_opened_at',
            type: 'integer',
          },
          {
            id: 'last_email_clicked_at',
            label: 'last_email_clicked_at',
            type: 'integer',
          },
          {
            id: 'language_override',
            label: 'language_override',
            type: 'string',
          },
          {
            id: 'browser',
            label: 'browser',
            type: 'string',
          },
          {
            id: 'browser_version',
            label: 'browser_version',
            type: 'string',
          },
          {
            id: 'browser_language',
            label: 'browser_language',
            type: 'string',
          },
          {
            id: 'os',
            label: 'os',
            type: 'string',
          },
          {
            id: 'android_app_name',
            label: 'android_app_name',
            type: 'string',
          },
          {
            id: 'android_app_version',
            label: 'android_app_version',
            type: 'string',
          },
          {
            id: 'android_device',
            label: 'android_device',
            type: 'string',
          },
          {
            id: 'android_os_version',
            label: 'android_os_version',
            type: 'string',
          },
          {
            id: 'android_sdk_version',
            label: 'android_sdk_version',
            type: 'string',
          },
          {
            id: 'android_last_seen_at',
            label: 'android_last_seen_at',
            type: 'integer',
          },
          {
            id: 'ios_app_name',
            label: 'ios_app_name',
            type: 'string',
          },
          {
            id: 'ios_app_version',
            label: 'ios_app_version',
            type: 'string',
          },
          {
            id: 'ios_device',
            label: 'ios_device',
            type: 'string',
          },
          {
            id: 'ios_os_version',
            label: 'ios_os_version',
            type: 'string',
          },
          {
            id: 'ios_sdk_version',
            label: 'ios_sdk_version',
            type: 'string',
          },
          {
            id: 'ios_last_seen_at',
            label: 'ios_last_seen_at',
            type: 'integer',
          },
          {
            id: 'custom_attributes',
            label: 'custom_attributes',
            type: 'object',
          },
          {
            id: 'avatar',
            label: 'avatar',
            type: 'object',
          },
          {
            id: 'notes',
            label: 'notes',
            type: 'object',
          },
          {
            id: 'companies',
            label: 'companies',
            type: 'object',
          },
          {
            id: 'location',
            label: 'location',
            type: 'object',
          },
          {
            id: 'social_profiles',
            label: 'social_profiles',
            type: 'object',
          },
        ];
      default:
        throw new BadRequestError('Only company and contact objects are supported for intercom');
    }
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
        const { data } = await axios.get<IntercomPaginatedScrollResponse>(`${this.baseUrl}/${path}`, {
          headers: this.#getAuthHeaders(),
          params: {
            per_page: PAGINATION_LIMIT,
            scroll_param: cursor,
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
    return paginator([
      {
        pageFetcher: this.#getScrollPaginatedListFetcher(path),
        createStreamFromPage: ({ data: records }) => {
          const emittedAt = new Date();
          return Readable.from(records.map((record) => mapper(record, emittedAt)));
        },
        getNextCursorFromPage: (response) => (response.data.length ? response.scroll_param : undefined),
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
              lastModifiedAt: record.updated_at ? new Date((record.updated_at as number) * 1000) : new Date(0),
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
              lastModifiedAt: record.updated_at ? new Date((record.updated_at as number) * 1000) : new Date(0),
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
            lastModifiedAt: record.updated_at ? new Date((record.updated_at as number) * 1000) : new Date(0),
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
            lastModifiedAt: record.updated_at ? new Date((record.updated_at as number) * 1000) : new Date(0),
            emittedAt,
          };
          return ret;
        });
      case 'company':
        return await this.#getScrollPaginator('companies/scroll', (record, emittedAt) => {
          const ret: ListedObjectRecord<IntercomRecord> = {
            id: record.id,
            rawData: record,
            rawProperties: record,
            isDeleted: false,
            lastModifiedAt: record.updated_at ? new Date((record.updated_at as number) * 1000) : new Date(0),
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
