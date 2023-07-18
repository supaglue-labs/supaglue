import type {
  ConnectionUnsafe,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import axios from 'axios';
import { Readable } from 'stream';
import { retryWhenAxiosRateLimited } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';
import { paginator } from '../../utils/paginator';
import {
  fromApolloContactToContact,
  fromApolloContactToSequenceStates,
  fromApolloEmailAccountsToMailbox,
  fromApolloSequenceToSequence,
  fromApolloUserToUser,
} from './mapper';

type ApolloPagination = {
  // Apollo sometimes returns a number, or the stringified number
  page: string | number | null;
  per_page: number;
  total_entries: number;
  total_pages: number;
};

type ApolloPaginatedContacts = {
  contacts: Record<string, any>[];
  pagination: ApolloPagination;
};

type ApolloPaginatedUsers = {
  users: Record<string, any>[];
  pagination: ApolloPagination;
};

type ApolloPaginatedSequences = {
  emailer_campaigns: Record<string, any>[];
  pagination: ApolloPagination;
};

class ApolloClient extends AbstractEngagementRemoteClient {
  readonly #apiKey: string;
  readonly #headers: Record<string, string>;
  readonly #baseURL: string;

  public constructor(apiKey: string) {
    super('https://api.apollo.io');
    this.#baseURL = 'https://api.apollo.io';
    this.#apiKey = apiKey;
    this.#headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {};
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    // Apollo requires the api key to be in the query string for GET requests, and in the body for POST/PATCH/PUT.
    // Note: This is not explicitly documented, but seems to be the convention for their API
    if (request.method === 'GET') {
      return await super.sendPassthroughRequest({ ...request, query: { ...request.query, api_key: this.#apiKey } });
    }
    if (request.method === 'POST' || request.method === 'PATCH' || request.method === 'PUT') {
      const bodyJson = request.body ? JSON.parse(request.body as string) : {};
      bodyJson['api_key'] = this.#apiKey;
      return await super.sendPassthroughRequest({ ...request, body: JSON.stringify(bodyJson) });
    }
    throw new Error(`Method ${request.method} not supported for the Apollo passthrough API`);
  }

  async #getContactPage(page = 1, updatedAfter?: Date): Promise<ApolloPaginatedContacts> {
    return await retryWhenAxiosRateLimited(async () => {
      const response = await axios.post<ApolloPaginatedContacts>(
        `${this.#baseURL}/v1/contacts/search`,
        {
          api_key: this.#apiKey,
          sort_by_field: 'contact_updated_at',
          sort_ascending: false,
          page,
        },
        {
          headers: this.#headers,
        }
      );
      return response.data;
    });
  }

  async #listContacts(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = async (pageAsStr?: string) =>
      await this.#getContactPage(pageAsStr ? parseInt(pageAsStr) : undefined, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.contacts.map((result) => ({
              record: fromApolloContactToContact(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => getNextPage(response.pagination)?.toString(),
      },
    ]);
  }

  async #getUserPage(page = 1, updatedAfter?: Date): Promise<ApolloPaginatedUsers> {
    return await retryWhenAxiosRateLimited(async () => {
      const response = await axios.get<ApolloPaginatedUsers>(`${this.#baseURL}/v1/users/search`, {
        headers: this.#headers,
        params: {
          api_key: this.#apiKey,
          page,
        },
      });
      return response.data;
    });
  }

  async #listUsers(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = async (pageAsStr?: string) =>
      await this.#getUserPage(pageAsStr ? parseInt(pageAsStr) : undefined, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.users.map((result) => ({
              record: fromApolloUserToUser(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => getNextPage(response.pagination)?.toString(),
      },
    ]);
  }

  async #getSequencePage(page = 1, updatedAfter?: Date): Promise<ApolloPaginatedSequences> {
    return await retryWhenAxiosRateLimited(async () => {
      const response = await axios.post<ApolloPaginatedSequences>(
        `${this.#baseURL}/v1/emailer_campaigns/search`,
        {
          api_key: this.#apiKey,
          page,
        },
        {
          headers: this.#headers,
        }
      );
      return response.data;
    });
  }

  async #listSequences(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = async (pageAsStr?: string) =>
      await this.#getSequencePage(pageAsStr ? parseInt(pageAsStr) : undefined, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.emailer_campaigns.map((result) => ({
              record: fromApolloSequenceToSequence(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => getNextPage(response.pagination)?.toString(),
      },
    ]);
  }

  async #listMailboxes(updatedAfter?: Date): Promise<Readable> {
    return await retryWhenAxiosRateLimited(async () => {
      const response = await axios.get<{ email_accounts: Record<string, any>[] }>(
        `${this.#baseURL}/v1/email_accounts`,
        {
          headers: this.#headers,
          params: {
            api_key: this.#apiKey,
          },
        }
      );
      // There is no pagination for mailboxes, so just emit them as is.
      return Readable.from(
        response.data.email_accounts.map((record) => ({
          record: fromApolloEmailAccountsToMailbox(record),
          emittedAt: new Date(),
        }))
      );
    });
  }

  async #listSequenceStates(updatedAfter?: Date): Promise<Readable> {
    const normalPageFetcher = async (pageAsStr?: string) =>
      await this.#getContactPage(pageAsStr ? parseInt(pageAsStr) : undefined, updatedAfter);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.contacts.flatMap(fromApolloContactToSequenceStates).map((sequenceState) => ({
              record: sequenceState,
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => getNextPage(response.pagination)?.toString(),
      },
    ]);
  }

  public override async listCommonObjectRecords(
    commonObjectType: 'contact' | 'user' | 'sequence' | 'mailbox' | 'sequence_state',
    updatedAfter?: Date | undefined
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#listContacts(updatedAfter);
      case 'user':
        return await this.#listUsers(updatedAfter);
      case 'sequence':
        return await this.#listSequences(updatedAfter);
      case 'mailbox':
        return await this.#listMailboxes(updatedAfter);
      case 'sequence_state':
        return await this.#listSequenceStates(updatedAfter);
      default:
        throw new Error(`Common object type ${commonObjectType} not supported for the Apollo API`);
    }
  }
}

export function newClient(connection: ConnectionUnsafe<'apollo'>, provider: Provider): ApolloClient {
  return new ApolloClient(connection.credentials.apiKey);
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: '',
  tokenPath: '',
  authorizeHost: '',
  authorizePath: '',
};

function getNextPage(pagination: ApolloPagination): number | undefined {
  if (!pagination.page) {
    return;
  }
  const pageAsNum = typeof pagination.page === 'number' ? pagination.page : parseInt(pagination.page);
  if (pageAsNum === pagination.total_pages) {
    return;
  }
  return pageAsNum + 1;
}
