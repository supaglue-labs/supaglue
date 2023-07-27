import type {
  ConnectionUnsafe,
  EngagementOauthProvider,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type { EngagementCommonObjectType } from '@supaglue/types/engagement';
import axios from 'axios';
import { Readable } from 'stream';
import { BadRequestError } from '../../../errors';
import { REFRESH_TOKEN_THRESHOLD_MS, retryWhenAxiosRateLimited } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';
import { paginator } from '../../utils/paginator';
import {
  fromSalesloftCadenceMembershipToSequenceState,
  fromSalesloftCadenceToSequence,
  fromSalesloftPersonToContact,
  fromSalesloftUserToUser,
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

  private async listContacts(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/v2/people`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: fromSalesloftPersonToContact(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.metadata.paging?.next_page?.toString(),
      },
    ]);
  }

  private async listUsers(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/v2/users`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: fromSalesloftUserToUser(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.metadata.paging?.next_page?.toString(),
      },
    ]);
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
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/v2/cadences`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => {
              return {
                record: fromSalesloftCadenceToSequence(result, stepCounts[result.id?.toString()] ?? 0),
                emittedAt,
              };
            })
          );
        },
        getNextCursorFromPage: (response) => response.metadata.paging?.next_page?.toString(),
      },
    ]);
  }

  private async listSequenceStates(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/v2/cadence_memberships`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: fromSalesloftCadenceMembershipToSequenceState(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.metadata.paging?.next_page?.toString(),
      },
    ]);
  }

  private async listMailboxes(updatedAfter?: Date): Promise<Readable> {
    return Readable.from([]);
  }

  public override async listCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'contact':
        return await this.listContacts(updatedAfter);
      case 'user':
        return await this.listUsers(updatedAfter);
      case 'sequence':
        return await this.listSequences(updatedAfter);
      case 'mailbox':
        return await this.listMailboxes(updatedAfter);
      case 'sequence_state':
        return await this.listSequenceStates(updatedAfter);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported for salesloft`);
    }
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
