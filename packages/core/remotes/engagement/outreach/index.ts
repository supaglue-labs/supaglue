import {
  ConnectionUnsafe,
  EngagementProvider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import {
  ContactCreateParams,
  ContactUpdateParams,
  ContactV2,
  EngagementCommonModelType,
  EngagementCommonModelTypeMap,
  MailboxV2,
  SequenceStateCreateParams,
  SequenceStateV2,
  SequenceV2,
  UserV2,
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
} from '../../../errors';
import { REFRESH_TOKEN_THRESHOLD_MS, retryWhenAxiosRateLimited } from '../../../lib';
import { paginator } from '../../utils/paginator';
import { AbstractEngagementRemoteClient, ConnectorAuthConfig } from '../base';
import {
  fromOutreachMailboxToMailboxV2,
  fromOutreachProspectToContactV2,
  fromOutreachSequenceStateToSequenceStateV2,
  fromOutreachSequenceToSequenceV2,
  fromOutreachUserToUserV2,
  toOutreachProspectCreateParams,
  toOutreachProspectUpdateParams,
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

  public override async getCommonObjectRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<EngagementCommonModelTypeMap<T>['object']> {
    switch (commonModelType) {
      case 'contact':
        return await this.getContact(id);
      case 'user':
        return await this.getUser(id);
      case 'sequence':
        return await this.getSequence(id);
      case 'mailbox':
        return await this.getMailbox(id);
      case 'sequence_state':
        return await this.getSequenceState(id);
      default:
        throw new Error(`Common model ${commonModelType} not supported`);
    }
  }

  async getContact(id: string): Promise<ContactV2> {
    const response = await axios.get<{ data: OutreachRecord }>(`${this.#baseURL}/api/v2/prospects/${id}`, {
      headers: this.#headers,
    });
    return fromOutreachProspectToContactV2(response.data.data);
  }

  async getUser(id: string): Promise<UserV2> {
    const response = await axios.get<{ data: OutreachRecord }>(`${this.#baseURL}/api/v2/users/${id}`, {
      headers: this.#headers,
    });
    return fromOutreachUserToUserV2(response.data.data);
  }

  async getSequence(id: string): Promise<SequenceV2> {
    const response = await axios.get<{ data: OutreachRecord }>(`${this.#baseURL}/api/v2/sequences/${id}`, {
      headers: this.#headers,
    });
    return fromOutreachSequenceToSequenceV2(response.data.data);
  }

  async getMailbox(id: string): Promise<MailboxV2> {
    const response = await axios.get<{ data: OutreachRecord }>(`${this.#baseURL}/api/v2/mailboxes/${id}`, {
      headers: this.#headers,
    });
    return fromOutreachMailboxToMailboxV2(response.data.data);
  }

  async getSequenceState(id: string): Promise<SequenceStateV2> {
    const response = await axios.get<{ data: OutreachRecord }>(`${this.#baseURL}/api/v2/sequence_states/${id}`, {
      headers: this.#headers,
    });
    return fromOutreachSequenceStateToSequenceStateV2(response.data.data);
  }

  public override async listCommonObjectRecords(
    commonModelType: EngagementCommonModelType,
    updatedAfter?: Date
  ): Promise<Readable> {
    switch (commonModelType) {
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
        throw new Error(`Common model ${commonModelType} not supported`);
    }
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (
      !this.#credentials.expiresAt ||
      Date.parse(this.#credentials.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS
    ) {
      const response = await axios.post<{ access_token: string; expires_in: number }>(`${this.#baseURL}/oauth/token`, {
        client_id: this.#credentials.clientId,
        client_secret: this.#credentials.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: this.#credentials.refreshToken,
      });

      const newAccessToken = response.data.access_token;
      const newExpiresAt = new Date(Date.now() + response.data.expires_in * 1000).toISOString();

      this.#credentials.accessToken = newAccessToken;
      this.#credentials.expiresAt = newExpiresAt;

      this.emit('token_refreshed', newAccessToken, newExpiresAt);
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

  private async listContacts(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/prospects`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: fromOutreachProspectToContactV2(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  private async listUsers(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/users`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: fromOutreachUserToUserV2(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  private async listSequences(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/sequences`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: fromOutreachSequenceToSequenceV2(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  private async listMailboxes(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/mailboxes`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: fromOutreachMailboxToMailboxV2(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  private async listSequenceStates(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/sequenceStates`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.data.map((result) => ({
              record: fromOutreachSequenceStateToSequenceStateV2(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  public override async createCommonObjectRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    switch (commonModelType) {
      case 'sequence_state':
        return await this.createSequenceState(params as SequenceStateCreateParams);
      case 'contact':
        return await this.createContact(params as ContactCreateParams);
      case 'sequence':
      case 'mailbox':
      case 'user':
        throw new Error(`Create operation not supported for ${commonModelType} object`);
      default:
        throw new Error(`Common model ${commonModelType} not supported`);
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

  public override async updateCommonObjectRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['updateParams']
  ): Promise<string> {
    switch (commonModelType) {
      case 'contact':
        return await this.updateContact(params as ContactUpdateParams);
      default:
        throw new Error(`Update not supported for common model ${commonModelType}`);
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

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }

  public handleErr(err: unknown): unknown {
    if (!(err instanceof AxiosError)) {
      return err;
    }

    switch (err.response?.status) {
      case 400:
        return new BadRequestError(err.message);
      case 401:
        return new UnauthorizedError(err.message);
      case 403:
        return new ForbiddenError(err.message);
      case 404:
        return new NotFoundError(err.message);
      case 409:
        return new ConflictError(err.message);
      case 429:
        return new TooManyRequestsError(err.message);
      default:
        return err;
    }
  }
}

export function newClient(connection: ConnectionUnsafe<'outreach'>, provider: EngagementProvider): OutreachClient {
  return new OutreachClient({
    ...connection.credentials,
    clientId: provider.config.oauth.credentials.oauthClientId,
    clientSecret: provider.config.oauth.credentials.oauthClientSecret,
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
