import type {
  ConnectionUnsafe,
  EngagementOauthProvider,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type {
  AccountCreateParams,
  AccountUpdateParams,
  ContactCreateParams,
  ContactUpdateParams,
  EngagementCommonObjectType,
  EngagementCommonObjectTypeMap,
  SequenceCreateParams,
  SequenceStateCreateParams,
  SequenceStepCreateParams,
} from '@supaglue/types/engagement';
import axios, { AxiosError } from 'axios';
import { Readable } from 'stream';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  UnauthorizedError,
  UnprocessableEntityError,
} from '../../../errors';
import { REFRESH_TOKEN_THRESHOLD_MS, retryWhenAxiosRateLimited } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';
import { paginator } from '../../utils/paginator';
import {
  fromOutreachAccountToAccount,
  fromOutreachMailboxToMailbox,
  fromOutreachProspectToContact,
  fromOutreachSequenceStateToSequenceState,
  fromOutreachSequenceToSequence,
  fromOutreachUserToUser,
  toOutreachAccountCreateParams,
  toOutreachAccountUpdateParams,
  toOutreachProspectCreateParams,
  toOutreachProspectUpdateParams,
  toOutreachSequenceCreateParams,
  toOutreachSequenceStateCreateParams,
} from './mappers';

const OUTREACH_RECORD_LIMIT = 50;

const DEFAULT_LIST_PARAMS = {
  'page[size]': OUTREACH_RECORD_LIMIT,
};

export type OutreachRecord = {
  id: number;
  attributes: Record<string, any>;
  relationships: Record<string, any>;
  links: Record<string, any>;
};

type OutreachPaginatedRecords = {
  data: OutreachRecord[];
  meta: { count: number; count_truncated: boolean };
  links: {
    first?: string;
    next?: string;
    prev?: string;
  };
};

type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
};

class OutreachClient extends AbstractEngagementRemoteClient {
  readonly #credentials: Credentials;
  readonly #headers: Record<string, string>;
  readonly #baseURL: string;
  public constructor(credentials: Credentials) {
    super('https://api.outreach.io');
    this.#baseURL = 'https://api.outreach.io';
    this.#credentials = credentials;
    this.#headers = { Authorization: `Bearer ${this.#credentials.accessToken}` };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.#headers;
  }

  public override async getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#getRecord(id, '/api/v2/prospects', fromOutreachProspectToContact);
      case 'user':
        return await this.#getRecord(id, '/api/v2/users', fromOutreachUserToUser);
      case 'sequence':
        return await this.#getRecord(id, '/api/v2/sequences', fromOutreachSequenceToSequence);
      case 'mailbox':
        return await this.#getRecord(id, '/api/v2/mailboxes', fromOutreachMailboxToMailbox);
      case 'sequence_state':
        return await this.#getRecord(id, '/api/v2/sequenceStates', fromOutreachSequenceStateToSequenceState);
      case 'account':
        return await this.#getRecord(id, '/api/v2/accounts', fromOutreachAccountToAccount);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async #getRecord<T>(id: string, path: string, mapper: (record: OutreachRecord) => T): Promise<T> {
    const response = await axios.get<{ data: OutreachRecord }>(`${this.#baseURL}${path}/${id}`, {
      headers: this.#headers,
    });
    return mapper(response.data.data);
  }

  public override async listCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#listRecords('/api/v2/prospects', fromOutreachProspectToContact, updatedAfter);
      case 'user':
        return await this.#listRecords('/api/v2/users', fromOutreachUserToUser, updatedAfter);
      case 'sequence':
        return await this.#listRecords('/api/v2/sequences', fromOutreachSequenceToSequence, updatedAfter);
      case 'mailbox':
        return await this.#listRecords('/api/v2/mailboxes', fromOutreachMailboxToMailbox, updatedAfter);
      case 'sequence_state':
        return await this.#listRecords(
          '/api/v2/sequenceStates',
          fromOutreachSequenceStateToSequenceState,
          updatedAfter
        );
      case 'account':
        return await this.#listRecords('/api/v2/accounts', fromOutreachAccountToAccount, updatedAfter);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (
      !this.#credentials.expiresAt ||
      Date.parse(this.#credentials.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS
    ) {
      const response = await axios.post<{ refresh_token: string; access_token: string; expires_in: number }>(
        `${this.#baseURL}/oauth/token`,
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

  #getListRecordsFetcher(endpoint: string, updatedAfter?: Date): (link?: string) => Promise<OutreachPaginatedRecords> {
    return async (link?: string) => {
      return await retryWhenAxiosRateLimited(async () => {
        await this.maybeRefreshAccessToken();
        if (link) {
          const response = await axios.get<OutreachPaginatedRecords>(link, {
            headers: this.#headers,
          });
          return response.data;
        }
        const response = await axios.get<OutreachPaginatedRecords>(endpoint, {
          params: updatedAfter
            ? {
                ...DEFAULT_LIST_PARAMS,
                ...getUpdatedAfterPathParam(updatedAfter),
              }
            : DEFAULT_LIST_PARAMS,
          headers: this.#headers,
        });
        return response.data;
      });
    };
  }

  async #listRecords<T>(path: string, mapper: (record: OutreachRecord) => T, updatedAfter?: Date): Promise<Readable> {
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
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  public override async createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    switch (commonObjectType) {
      case 'sequence_state':
        return await this.createSequenceState(params as SequenceStateCreateParams);
      case 'contact':
        return await this.createContact(params as ContactCreateParams);
      case 'account':
        return await this.createAccount(params as AccountCreateParams);
      case 'sequence':
        return await this.createSequence(params as SequenceCreateParams);
      case 'sequence_step':
      case 'mailbox':
      case 'user':
        throw new BadRequestError(`Create operation not supported for ${commonObjectType} object`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async createContact(params: ContactCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/prospects`,
      toOutreachProspectCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async createAccount(params: AccountCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/accounts`,
      toOutreachAccountCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async createSequenceState(params: SequenceStateCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/sequenceStates`,
      toOutreachSequenceStateCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async createSequence(params: SequenceCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/sequences`,
      toOutreachSequenceCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async createSequenceStep(params: SequenceStepCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/sequences`,
      toOutreachSequenceStepCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  public override async updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<string> {
    switch (commonObjectType) {
      case 'contact':
        return await this.updateContact(params as ContactUpdateParams);
      case 'account':
        return await this.updateAccount(params as AccountUpdateParams);
      default:
        throw new BadRequestError(`Update not supported for common object ${commonObjectType}`);
    }
  }

  async updateContact(params: ContactUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.patch<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/prospects/${params.id}`,
      toOutreachProspectUpdateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  async updateAccount(params: AccountUpdateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.patch<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/accounts/${params.id}`,
      toOutreachAccountUpdateParams(params),
      {
        headers: this.#headers,
      }
    );
    return response.data.data.id.toString();
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }

  public override handleErr(err: unknown): unknown {
    if (!(err instanceof AxiosError)) {
      return err;
    }

    const jsonError = err.response?.data?.errors?.[0];

    switch (err.response?.status) {
      case 400:
        return new BadRequestError(jsonError?.detail ?? err.message);
      case 401:
        return new UnauthorizedError(jsonError?.detail ?? err.message);
      case 403:
        return new ForbiddenError(jsonError?.detail ?? err.message);
      case 404:
        return new NotFoundError(jsonError?.detail ?? err.message);
      case 409:
        return new ConflictError(jsonError?.detail ?? err.message);
      case 422:
        return new UnprocessableEntityError(
          jsonError?.detail ? `${jsonError.detail} source ${JSON.stringify(jsonError.source)}` : err.message
        );
      case 429:
        return new TooManyRequestsError(jsonError?.detail ?? err.message);
      default:
        return err;
    }
  }
}

export function newClient(connection: ConnectionUnsafe<'outreach'>, provider: Provider): OutreachClient {
  return new OutreachClient({
    ...connection.credentials,
    clientId: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.outreach.io',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://api.outreach.io',
  authorizePath: '/oauth/authorize',
};

function getUpdatedAfterPathParam(updatedAfter: Date) {
  // Outreach's updatedAt filter is inclusive, so we need to add 1 millisecond.
  const plusOneMs = new Date(updatedAfter.getTime() + 1);
  return {
    'filter[updatedAt]': `${plusOneMs.toISOString()}..inf`,
  };
}
