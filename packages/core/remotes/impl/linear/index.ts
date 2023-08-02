import { LinearClient as NativeLinearClient, LinearDocument } from '@linear/sdk';
import type { ConnectionUnsafe, ListedObjectRecord, NoCategoryProvider, Provider } from '@supaglue/types';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import { Readable } from 'stream';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractNoCategoryRemoteClient } from '../../categories/no_category/base';
import { paginator } from '../../utils/paginator';
import type { LinearStandardObject, LinearStandardObjectConnection } from './mappers';
import { toLinearStandardObject } from './mappers';

const PAGINATION_LIMIT = 250;

type LinearRecord = {
  id: string;
  updatedAt: Date;
};

type LinearClientConfig = {
  accessToken: string;
  clientId: string;
  clientSecret: string;
};

class LinearClient extends AbstractNoCategoryRemoteClient {
  readonly #client: NativeLinearClient;
  readonly #config: LinearClientConfig;
  public constructor(config: LinearClientConfig) {
    super('https://api.linear.app/graphql');
    const { accessToken } = config;
    this.#client = new NativeLinearClient({
      accessToken,
    });
    this.#config = config;
  }

  #getAuthHeaders(): Record<string, string> {
    return {
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${this.#config.accessToken}`,
    };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.#getAuthHeaders();
  }

  #getPaginatedListFetcher(
    key: LinearStandardObject,
    modifiedAfter?: Date
  ): (cursor?: string) => Promise<LinearStandardObjectConnection> {
    return async (cursor?: string) => {
      return await this.#client[key]({
        filter: {
          updatedAt: {
            gt: modifiedAfter,
          },
        },
        after: cursor,
        first: PAGINATION_LIMIT,
        orderBy: LinearDocument.PaginationOrderBy.UpdatedAt,
      });
    };
  }

  #getPaginator(
    key: LinearStandardObject,
    mapper: (record: LinearRecord, emittedAt: Date) => ListedObjectRecord<LinearRecord>,
    modifiedAfter?: Date
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.#getPaginatedListFetcher(key, modifiedAfter),
        createStreamFromPage: ({ nodes: records }) => {
          const emittedAt = new Date();
          return Readable.from(records.map((record) => mapper(record, emittedAt)));
        },
        getNextCursorFromPage: (response) => response.pageInfo.endCursor,
      },
    ]);
  }

  public override async listStandardObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date | undefined,
    heartbeat?: (() => void) | undefined
  ): Promise<Readable> {
    const validatedObject = toLinearStandardObject(object);

    return await this.#getPaginator(
      validatedObject,
      (record, emittedAt) => ({
        id: record.id,
        rawData: record,
        rawProperties: record,
        isDeleted: false,
        lastModifiedAt: record.updatedAt ?? new Date(0),
        emittedAt,
      }),
      modifiedAfter
    );
  }
}

export function newClient(connection: ConnectionUnsafe<'linear'>, provider: Provider): LinearClient {
  return new LinearClient({
    accessToken: connection.credentials.accessToken,
    clientId: (provider as NoCategoryProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as NoCategoryProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.linear.app',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://linear.app',
  authorizePath: '/oauth/authorize',
};
