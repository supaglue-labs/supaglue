import type {
  ConnectionUnsafe,
  EngagementOauthProvider,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type {
  Account,
  AccountCreateParams,
  Contact,
  ContactCreateParams,
  EngagementCommonObjectType,
  EngagementCommonObjectTypeMap,
  Sequence,
  SequenceState,
  SequenceStateCreateParams,
  User,
} from '@supaglue/types/engagement';
import axios from 'axios';
import { Readable } from 'stream';
import { BadRequestError } from '../../../errors';
import { REFRESH_TOKEN_THRESHOLD_MS, retryWhenAxiosRateLimited } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';
import { paginator } from '../../utils/paginator';
import {
  fromSalesloftAccountToAccount,
  fromSalesloftCadenceMembershipToSequenceState,
  fromSalesloftCadenceToSequence,
  fromSalesloftPersonToContact,
  fromSalesloftUserToUser,
  toSalesloftAccountCreateParams,
  toSalesloftContactCreateParams,
  toSalesloftSequenceStateCreateParams,
} from './mappers';

type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
};

const SALESLOFT_RECORD_LIMIT = 100;

const DEFAULT_LIST_PARAMS = {
  per_page: SALESLOFT_RECORD_LIMIT,
};

type SalesloftPaginatedRecords = {
  metadata: {
    paging?: {
      per_page: number;
      current_page: number;
      next_page: number | null;
      prev_page: number | null;
      total_pages?: number;
      total_count?: number;
    };
  };
  data: Record<string, any>[];
};

type SalesloftPaginatedRecordsWithCount = {
  metadata: {
    paging: {
      per_page: number;
      current_page: number;
      next_page: number | null;
      prev_page: number | null;
      total_pages: number;
      total_count: number;
    };
  };
  data: Record<string, any>[];
};

class SalesloftClient extends AbstractEngagementRemoteClient {
  readonly #credentials: Credentials;
  readonly #headers: Record<string, string>;
  readonly #baseURL: string;

  public constructor(credentials: Credentials) {
    super('https://api.salesloft.com');
    this.#baseURL = 'https://api.salesloft.com';
    this.#credentials = credentials;
    this.#headers = { Authorization: `Bearer ${this.#credentials.accessToken}` };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.#headers;
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (
      !this.#credentials.expiresAt ||
      Date.parse(this.#credentials.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS
    ) {
      const response = await axios.post<{ refresh_token: string; access_token: string; expires_in: number }>(
        `${authConfig.tokenHost}${authConfig.tokenPath}`,
        {
          client_id: this.#credentials.clientId,
          client_secret: this.#credentials.clientSecret,
          grant_type: 'refresh_token',
          refresh_token: this.#credentials.refreshToken,
        }
      );

      const newAccessToken = response.data.access_token;
      const newRefreshToken = response.data.refresh_token;
      const newExpiresAt = new Date(Date.now() + response.data.expires_in * 1000).toISOString();

      this.#credentials.accessToken = newAccessToken;
      this.#credentials.refreshToken = newRefreshToken;
      this.#credentials.expiresAt = newExpiresAt;

      this.emit('token_refreshed', {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
      });
    }
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }

  public override async getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#getRecord<Contact>(id, '/v2/people', fromSalesloftPersonToContact);
      case 'user':
        return await this.#getRecord<User>(id, '/v2/users', fromSalesloftUserToUser);
      case 'account':
        return await this.#getRecord<Account>(id, '/v2/accounts', fromSalesloftAccountToAccount);
      case 'sequence': {
        const stepCount = await this.#getCadenceStepCount(id);
        return await this.#getRecord<Sequence>(id, '/v2/cadences', (data) =>
          fromSalesloftCadenceToSequence(data, stepCount)
        );
      }
      case 'sequence_state':
        return await this.#getRecord<SequenceState>(
          id,
          '/v2/cadence_memberships',
          fromSalesloftCadenceMembershipToSequenceState
        );
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported for Salesloft`);
    }
  }

  async #getRecord<T>(id: string, path: string, mapper: (data: Record<string, unknown>) => T): Promise<T> {
    const response = await axios.get<{ data: Record<string, unknown> }>(`${this.#baseURL}${path}/${id}`, {
      headers: this.#headers,
    });
    return mapper(response.data.data);
  }

  #getListRecordsFetcher(endpoint: string, updatedAfter?: Date): (next?: string) => Promise<SalesloftPaginatedRecords> {
    return async (next?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        const response = await axios.get<SalesloftPaginatedRecords>(endpoint, {
          params: updatedAfter
            ? {
                ...DEFAULT_LIST_PARAMS,
                ...getUpdatedAfterPathParam(updatedAfter),
                page: next ? parseInt(next) : undefined,
              }
            : DEFAULT_LIST_PARAMS,
          headers: this.#headers,
        });
        return response.data;
      });
    };
  }

  async #getCadenceStepCount(cadenceId: string): Promise<number> {
    const response = await axios.get<SalesloftPaginatedRecords>(
      `${this.#baseURL}/v2/steps?cadence_id=${cadenceId}&include_paging_counts=1`,
      {
        headers: this.#headers,
      }
    );
    return response.data.metadata.paging?.total_count || 0;
  }

  async #getCadenceStepCounts(): Promise<Record<string, number>> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/v2/steps`);
    const stream = await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.data),
        getNextCursorFromPage: (response) => response.metadata.paging?.next_page?.toString(),
      },
    ]);
    // Mapping from cadenceId => number of steps
    const stepCountMapping: Record<string, number> = {};

    for await (const step of stream) {
      const cadenceId = step.cadence?.id?.toString();
      if (!cadenceId) {
        // This should never happen
        continue;
      }
      if (stepCountMapping[cadenceId]) {
        stepCountMapping[cadenceId] += 1;
      } else {
        stepCountMapping[cadenceId] = 1;
      }
    }
    return stepCountMapping;
  }

  private async listSequences(updatedAfter?: Date): Promise<Readable> {
    const stepCounts = await this.#getCadenceStepCounts();
    return await this.#listRecords(
      '/v2/cadences',
      (data) => fromSalesloftCadenceToSequence(data, stepCounts[data.id?.toString()] ?? 0),
      updatedAfter
    );
  }

  async #listRecords<T>(
    path: string,
    mapper: (data: Record<string, any>) => T,
    updatedAfter?: Date
  ): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}${path}`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: mapper(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.metadata.paging?.next_page?.toString(),
      },
    ]);
  }

  public override async listCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#listRecords(`/v2/people`, fromSalesloftPersonToContact, updatedAfter);
      case 'user':
        return await this.#listRecords(`/v2/users`, fromSalesloftUserToUser, updatedAfter);
      case 'account':
        return await this.#listRecords(`/v2/accounts`, fromSalesloftAccountToAccount, updatedAfter);
      case 'sequence':
        return await this.listSequences(updatedAfter);
      case 'mailbox':
        return Readable.from([]);
      case 'sequence_state':
        return await this.#listRecords(
          '/v2/cadence_memberships',
          fromSalesloftCadenceMembershipToSequenceState,
          updatedAfter
        );
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported for salesloft`);
    }
  }

  async #createRecord(path: string, salesloftParams: Record<string, unknown>): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: { id: number } }>(`${this.#baseURL}${path}`, salesloftParams, {
      headers: this.#headers,
    });
    return response.data.data.id.toString();
  }

  public override async createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<{ id: string; record?: EngagementCommonObjectTypeMap<T>['object'] }> {
    switch (commonObjectType) {
      case 'sequence_state':
        return {
          id: await this.#createRecord(
            '/v2/cadence_memberships',
            toSalesloftSequenceStateCreateParams(params as SequenceStateCreateParams)
          ),
        };
      case 'account':
        return {
          id: await this.#createRecord('/v2/accounts', toSalesloftAccountCreateParams(params as AccountCreateParams)),
        };
      case 'contact':
        return {
          id: await this.#createRecord('/v2/people', toSalesloftContactCreateParams(params as ContactCreateParams)),
        };
      case 'sequence':
      case 'mailbox':
      case 'user':
        throw new BadRequestError(`Create operation not supported for ${commonObjectType} object in Salesloft`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported for Salesloft`);
    }
  }

  public override async updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<{ id: string; record?: EngagementCommonObjectTypeMap<T>['object'] }> {
    switch (commonObjectType) {
      case 'account':
        return {
          id: await this.#updateRecord(
            params.id,
            '/v2/accounts',
            toSalesloftAccountCreateParams(params as AccountCreateParams)
          ),
        };
      case 'contact':
        return {
          id: await this.#updateRecord(
            params.id,
            '/v2/people',
            toSalesloftContactCreateParams(params as ContactCreateParams)
          ),
        };
      default:
        throw new BadRequestError(`Update not supported for common object ${commonObjectType}`);
    }
  }

  async #updateRecord(id: string, path: string, salesloftParams: Record<string, unknown>): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.put<{ data: { id: number } }>(`${this.#baseURL}${path}/${id}`, salesloftParams, {
      headers: this.#headers,
    });
    return response.data.data.id.toString();
  }
}

export function newClient(connection: ConnectionUnsafe<'salesloft'>, provider: Provider): SalesloftClient {
  return new SalesloftClient({
    ...connection.credentials,
    clientId: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientSecret,
  });
}

// TODO: support other geographies
export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://accounts.salesloft.com',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://accounts.salesloft.com',
  authorizePath: '/oauth/authorize',
};

function getUpdatedAfterPathParam(updatedAfter: Date) {
  return {
    'updated_at[gt]': updatedAfter.toISOString(),
  };
}
