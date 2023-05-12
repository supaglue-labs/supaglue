import {
  ConnectionUnsafe,
  Integration,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import {
  EngagementCommonModelType,
  EngagementCommonModelTypeMap,
  RemoteContact,
  RemoteContactCreateParams,
  RemoteSequenceState,
  RemoteSequenceStateCreateParams,
} from '@supaglue/types/engagement';
import axios from 'axios';
import { Readable } from 'stream';
import { REFRESH_TOKEN_THRESHOLD_MS } from '../../../lib';
import { paginator } from '../../utils/paginator';
import { AbstractEngagementRemoteClient, ConnectorAuthConfig } from '../base';
import {
  fromOutreachMailboxToRemoteMailbox,
  fromOutreachProspectToRemoteContact,
  fromOutreachSequenceStateToRemoteSequenceState,
  fromOutreachSequenceToRemoteSequence,
  fromOutreachUserToRemoteUser,
  toOutreachProspectCreateParams,
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

  public override async listObjects(
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
    };
  }

  private async listContacts(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/prospects`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.data.map(fromOutreachProspectToRemoteContact)),
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  private async listUsers(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/users`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.data.map(fromOutreachUserToRemoteUser)),
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  private async listSequences(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/sequences`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.data.map(fromOutreachSequenceToRemoteSequence)),
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  private async listMailboxes(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/mailboxes`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => Readable.from(response.data.map(fromOutreachMailboxToRemoteMailbox)),
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  private async listSequenceStates(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/api/v2/sequenceStates`, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) =>
          Readable.from(response.data.map(fromOutreachSequenceStateToRemoteSequenceState)),
        getNextCursorFromPage: (response) => response.links?.next,
      },
    ]);
  }

  public override async createObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<EngagementCommonModelTypeMap<T>['object']> {
    switch (commonModelType) {
      case 'sequence_state':
        return await this.createSequenceState(params as RemoteSequenceStateCreateParams);
      case 'contact':
        return await this.createContact(params as RemoteContactCreateParams);
      case 'sequence':
      case 'mailbox':
      case 'user':
        throw new Error(`Create operation not supported for ${commonModelType} object`);
      default:
        throw new Error(`Common model ${commonModelType} not supported`);
    }
  }

  async createContact(params: RemoteContactCreateParams): Promise<RemoteContact> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/prospects`,
      toOutreachProspectCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return fromOutreachProspectToRemoteContact(response.data.data);
  }

  async createSequenceState(params: RemoteSequenceStateCreateParams): Promise<RemoteSequenceState> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: OutreachRecord }>(
      `${this.#baseURL}/api/v2/sequenceStates`,
      toOutreachSequenceStateCreateParams(params),
      {
        headers: this.#headers,
      }
    );
    return fromOutreachSequenceStateToRemoteSequenceState(response.data.data);
  }

  public override updateObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['updateParams']
  ): Promise<EngagementCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }
}

export function newClient(connection: ConnectionUnsafe<'outreach'>, integration: Integration): OutreachClient {
  return new OutreachClient({
    ...connection.credentials,
    clientId: integration.config.oauth.credentials.oauthClientId,
    clientSecret: integration.config.oauth.credentials.oauthClientSecret,
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
