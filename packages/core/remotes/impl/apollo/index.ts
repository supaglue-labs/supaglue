import axios from '@supaglue/core/remotes/sg_axios';
import type {
  ConnectionUnsafe,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type {
  AccountCreateParams,
  AccountUpdateParams,
  Contact,
  ContactCreateParams,
  ContactSearchParams,
  ContactUpdateParams,
  EngagementCommonObjectType,
  EngagementCommonObjectTypeMap,
  SequenceCreateParams,
  SequenceState,
  SequenceStateCreateParams,
  SequenceStateSearchParams,
  SequenceStepCreateParams,
} from '@supaglue/types/engagement';
import { Readable } from 'stream';
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  SGConnectionNoLongerAuthenticatedError,
} from '../../../errors';
import type { PaginatedSupaglueRecords } from '../../../lib';
import { retryWhenAxiosApolloRateLimited } from '../../../lib/apollo_ratelimit';
import type { ConnectorAuthConfig } from '../../base';
import type {
  CreateCommonObjectRecordResponse,
  UpdateCommonObjectRecordResponse,
} from '../../categories/engagement/base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';
import { paginator } from '../../utils/paginator';
import { createApolloClient } from './apollo.client';
import {
  fromApolloAccountToAccount,
  fromApolloContactCampaignStatusToSequenceState,
  fromApolloContactToContact,
  fromApolloContactToSequenceStates,
  fromApolloEmailAccountsToMailbox,
  fromApolloEmailerCampaignToSequence,
  fromApolloUserToUser,
  toApolloAccountCreateParams,
  toApolloAccountUpdateParams,
  toApolloContactCreateParams,
  toApolloContactUpdateParams,
} from './mappers';

const MAX_PAGE_SIZE = 100; // undocumented, but seems to be the max page size for Apollo

type ApolloPagination = {
  // Apollo sometimes returns a number, or the stringified number
  page: string | number | null;
  per_page: number;
  total_entries: number;
  total_pages: number;
};

type ApolloPaginatedAccounts = {
  accounts: Record<string, any>[];
  pagination: ApolloPagination;
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
  readonly #api: ReturnType<typeof createApolloClient>;

  public constructor(apiKey: string) {
    super('https://api.apollo.io');
    this.#baseURL = 'https://api.apollo.io';
    this.#apiKey = apiKey;
    this.#headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' };
    this.#api = createApolloClient({ apiKey });
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
      let bodyJson: Record<string, unknown> = {};
      if (typeof request.body === 'string') {
        bodyJson = JSON.parse(request.body);
      } else if (typeof request.body === 'object') {
        bodyJson = request.body;
      }
      bodyJson['api_key'] = this.#apiKey;
      return await super.sendPassthroughRequest({ ...request, body: JSON.stringify(bodyJson) });
    }
    throw new BadRequestError(`Method ${request.method} not supported for the Apollo passthrough API`);
  }

  public override async getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']> {
    switch (commonObjectType) {
      case 'sequence':
        return this.#api
          .GET('/v1/emailer_campaigns/{id}', { params: { path: { id } } })
          .then(({ data: { emailer_campaign: c } }) => fromApolloEmailerCampaignToSequence(c));
      case 'contact':
        return await this.#getContact(id);
      case 'account':
      case 'user':
      case 'mailbox':
      case 'sequence_state':
        throw new BadRequestError(`Get operation not supported for common object ${commonObjectType} in Apollo`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async #getContact(id: string): Promise<Contact> {
    return await retryWhenAxiosApolloRateLimited(async () => {
      // This uses a private API.
      const response = await axios.get<{ contact: Record<string, unknown> }>(`${this.#baseURL}/v1/contacts/${id}`, {
        headers: this.#headers,
        params: {
          api_key: this.#apiKey,
        },
      });
      return fromApolloContactToContact(response.data.contact);
    });
  }

  public override async searchCommonObjectRecords<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['searchParams']
  ): Promise<PaginatedSupaglueRecords<EngagementCommonObjectTypeMap<T>['object']>> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#searchContacts(params as ContactSearchParams);
      case 'sequence_state':
        return await this.#searchSequenceStates(params as SequenceStateSearchParams);
      case 'user':
      case 'mailbox':
      case 'sequence':
      case 'account':
        throw new BadRequestError(`Search operation not supported for common object ${commonObjectType} in Apollo`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async #searchContacts(params: ContactSearchParams): Promise<PaginatedSupaglueRecords<Contact>> {
    if (!params.filter.emails.length) {
      throw new BadRequestError('At least 1 email must be provided when searching contacts');
    }
    if (params.filter.emails.length > 1) {
      throw new BadRequestError('Only 1 email can be provided when searching contacts in Apollo');
    }
    return await retryWhenAxiosApolloRateLimited(async () => {
      const response = await axios.post<ApolloPaginatedContacts>(
        `${this.#baseURL}/v1/contacts/search`,
        {
          api_key: this.#apiKey,
          q_keywords: params.filter.emails[0],
        },
        {
          headers: this.#headers,
        }
      );
      const records = response.data.contacts.map(fromApolloContactToContact);
      return {
        records,
        pagination: {
          total_count: records.length,
          previous: null,
          next: null,
        },
      };
    });
  }

  async #searchSequenceStates(params: SequenceStateSearchParams): Promise<PaginatedSupaglueRecords<SequenceState>> {
    if (!params.filter.contactId) {
      throw new BadRequestError('Contact ID is required for searching sequence states in Apollo');
    }
    if (params.filter.sequenceId) {
      throw new BadRequestError('Sequence ID is not supported for searching sequence states in Apollo');
    }
    return await retryWhenAxiosApolloRateLimited(async () => {
      // This uses a private API.
      const response = await axios.get<{ contact: Record<string, unknown> }>(
        `${this.#baseURL}/v1/contacts/${params.filter.contactId}`,
        {
          headers: this.#headers,
          params: {
            api_key: this.#apiKey,
          },
        }
      );
      const records = fromApolloContactToSequenceStates(response.data.contact);
      return {
        records,
        pagination: {
          total_count: records.length,
          previous: null,
          next: null,
        },
      };
    });
  }

  async #getAccountPage(page = 1, updatedAfter?: Date, heartbeat?: () => void): Promise<ApolloPaginatedAccounts> {
    return await retryWhenAxiosApolloRateLimited(async () => {
      if (heartbeat) {
        heartbeat();
      }
      try {
        const response = await axios.post<ApolloPaginatedAccounts>(
          `${this.#baseURL}/v1/accounts/search`,
          {
            api_key: this.#apiKey,
            page,
            per_page: MAX_PAGE_SIZE,
          },
          {
            headers: this.#headers,
          }
        );
        return response.data;
      } catch (e) {
        throw await this.handleErr(e);
      }
    });
  }

  async #listAccounts(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    const normalPageFetcher = async (pageAsStr?: string) =>
      await this.#getAccountPage(pageAsStr ? parseInt(pageAsStr) : undefined, updatedAfter, heartbeat);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.accounts.map((result) => ({
              record: fromApolloAccountToAccount(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => getNextPage(response.pagination)?.toString(),
      },
    ]);
  }

  async #getContactPage(page = 1, updatedAfter?: Date, heartbeat?: () => void): Promise<ApolloPaginatedContacts> {
    return await retryWhenAxiosApolloRateLimited(async () => {
      if (heartbeat) {
        heartbeat();
      }
      try {
        const response = await axios.post<ApolloPaginatedContacts>(
          `${this.#baseURL}/v1/contacts/search`,
          {
            api_key: this.#apiKey,
            sort_by_field: 'contact_updated_at',
            sort_ascending: false,
            page,
            per_page: MAX_PAGE_SIZE,
          },
          {
            headers: this.#headers,
          }
        );
        return response.data;
      } catch (e) {
        throw await this.handleErr(e);
      }
    });
  }

  async #listContacts(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    const normalPageFetcher = async (pageAsStr?: string) =>
      await this.#getContactPage(pageAsStr ? parseInt(pageAsStr) : undefined, updatedAfter, heartbeat);
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

  async #getUserPage(page = 1, updatedAfter?: Date, heartbeat?: () => void): Promise<ApolloPaginatedUsers> {
    return await retryWhenAxiosApolloRateLimited(async () => {
      if (heartbeat) {
        heartbeat();
      }
      try {
        const response = await axios.get<ApolloPaginatedUsers>(`${this.#baseURL}/v1/users/search`, {
          headers: this.#headers,
          params: {
            api_key: this.#apiKey,
            page,
            per_page: MAX_PAGE_SIZE,
          },
        });
        return response.data;
      } catch (e) {
        throw await this.handleErr(e);
      }
    });
  }

  async #listUsers(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    const normalPageFetcher = async (pageAsStr?: string) =>
      await this.#getUserPage(pageAsStr ? parseInt(pageAsStr) : undefined, updatedAfter, heartbeat);
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

  async #getSequencePage(page = 1, updatedAfter?: Date, heartbeat?: () => void): Promise<ApolloPaginatedSequences> {
    return await retryWhenAxiosApolloRateLimited(async () => {
      if (heartbeat) {
        heartbeat();
      }
      try {
        const response = await axios.post<ApolloPaginatedSequences>(
          `${this.#baseURL}/v1/emailer_campaigns/search`,
          {
            api_key: this.#apiKey,
            page,
            per_page: MAX_PAGE_SIZE,
          },
          {
            headers: this.#headers,
          }
        );
        return response.data;
      } catch (e) {
        throw await this.handleErr(e);
      }
    });
  }

  async #listSequences(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    const normalPageFetcher = async (pageAsStr?: string) =>
      await this.#getSequencePage(pageAsStr ? parseInt(pageAsStr) : undefined, updatedAfter, heartbeat);
    return await paginator([
      {
        pageFetcher: normalPageFetcher,
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.emailer_campaigns.map((result) => ({
              record: fromApolloEmailerCampaignToSequence(result as any),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => getNextPage(response.pagination)?.toString(),
      },
    ]);
  }

  async #listMailboxes(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    return await retryWhenAxiosApolloRateLimited(async () => {
      if (heartbeat) {
        heartbeat();
      }
      try {
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
      } catch (e) {
        throw await this.handleErr(e);
      }
    });
  }

  async #listSequenceStates(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    const normalPageFetcher = async (pageAsStr?: string) =>
      await this.#getContactPage(pageAsStr ? parseInt(pageAsStr) : undefined, updatedAfter, heartbeat);
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

  public override async streamCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date | undefined,
    heartbeat?: () => void
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'account':
        return await this.#listAccounts(updatedAfter, heartbeat);
      case 'contact':
        return await this.#listContacts(updatedAfter, heartbeat);
      case 'user':
        return await this.#listUsers(updatedAfter, heartbeat);
      case 'sequence':
        return await this.#listSequences(updatedAfter, heartbeat);
      case 'mailbox':
        return await this.#listMailboxes(updatedAfter, heartbeat);
      case 'sequence_state':
        return await this.#listSequenceStates(updatedAfter, heartbeat);
      default:
        throw new BadRequestError(`Common object type ${commonObjectType} not supported for the Apollo API`);
    }
  }

  async createAccount(params: AccountCreateParams): Promise<CreateCommonObjectRecordResponse<'account'>> {
    const response = await axios.post<{ account: Record<string, any> }>(
      `${this.#baseURL}/v1/accounts`,
      { ...toApolloAccountCreateParams(params), api_key: this.#apiKey },
      {
        headers: this.#headers,
      }
    );
    return {
      id: response.data.account.id,
      record: fromApolloAccountToAccount(response.data.account),
    };
  }

  async createContact(params: ContactCreateParams): Promise<CreateCommonObjectRecordResponse<'contact'>> {
    const response = await axios.post<{ contact: Record<string, any> }>(
      `${this.#baseURL}/v1/contacts`,
      { ...toApolloContactCreateParams(params), api_key: this.#apiKey },
      {
        headers: this.#headers,
      }
    );
    return {
      id: response.data.contact.id.toString(),
      record: fromApolloContactToContact(response.data.contact),
    };
  }

  async createSequence(params: SequenceCreateParams): Promise<CreateCommonObjectRecordResponse<'sequence'>> {
    const { data: res } = await this.#api.POST('/v1/emailer_campaigns', {
      body: {
        name: params.name,
        permissions: params.type === 'private' ? 'private' : 'team_can_use',
        active: true,
        label_ids: params.tags,
        user_id: params.ownerId,
        ...params.customFields,
      },
    });

    // Cannot create steps concurrently for apollo otherwise we run into race conditions
    // due to apollo's lack of support for arbitary `position` https://share.cleanshot.com/KrZyhsMq
    for (const [i, step] of (params.steps ?? []).entries()) {
      await this.createSequenceStep({ ...step, sequenceId: res.emailer_campaign.id, order: i + 1 });
    }
    return { id: res.emailer_campaign.id, record: fromApolloEmailerCampaignToSequence(res.emailer_campaign) };
  }

  async createSequenceStep(
    params: SequenceStepCreateParams
  ): Promise<CreateCommonObjectRecordResponse<'sequence_step'>> {
    if (!params.sequenceId) {
      throw new BadRequestError('Sequence ID is required');
    }
    const intOnly = (n: number | null | undefined) => (Number.isInteger(n) ? (n as number) : null);
    const divide = (n: number | null, by: number) => (n != null ? n / by : null);

    const seconds = intOnly(params.intervalSeconds);
    const minutes = intOnly(divide(seconds, 60));
    const hours = intOnly(divide(minutes, 60));
    const days = intOnly(divide(hours, 24));

    const { data: r } = await this.#api.POST('/v1/emailer_steps', {
      body: {
        emailer_campaign_id: params.sequenceId,
        position: params.order ?? 1,
        type:
          params.type === 'linkedin_send_message'
            ? 'linkedin_step_message'
            : params.type === 'task'
              ? 'action_item'
              : params.type,
        ...(days
          ? { wait_mode: 'day', wait_time: days }
          : hours
            ? { wait_mode: 'hour', wait_time: hours }
            : minutes
              ? { wait_mode: 'minute', wait_time: minutes }
              : { wait_mode: 'second', wait_time: seconds ?? 0 }),
        exact_datetime: params.date, // Not clear exactly how this works
        note: params.taskNote,
        ...params.customFields,
      },
    });

    // Only exists for templatable steps like tasks / calls
    if (r.emailer_touch && r.emailer_template) {
      await this.#api.PUT('/v1/emailer_touches/{id}', {
        params: { path: { id: r.emailer_touch.id } },
        body: {
          id: r.emailer_touch.id,
          emailer_step_id: r.emailer_step.id,
          emailer_template:
            params.template && 'id' in params.template
              ? { id: params.template.id }
              : {
                  id: r.emailer_template.id,
                  subject: params.template?.subject,
                  body_html: params.template?.body,
                },
          type: params.isReply ? 'reply_to_thread' : 'new_thread',
        },
      });
    }
    return { id: r.emailer_step.id };
  }

  async batchCreateSequenceState(
    records: SequenceStateCreateParams[]
  ): Promise<Array<CreateCommonObjectRecordResponse<'sequence_state'>>> {
    const [sequenceId, ...otherSequenceIds] = Array.from(new Set(records.map((r) => r.sequenceId)));
    const [mailboxId, ...otherMailboxIds] = Array.from(new Set(records.map((r) => r.mailboxId)));
    const [userId, ...otherUserIds] = Array.from(new Set(records.map((r) => r.userId)));

    if (otherSequenceIds.length || otherMailboxIds.length || otherUserIds.length) {
      throw new BadRequestError(
        'Batch create sequence states only works when all records are for the same sequence, mailbox and user'
      );
    }
    if (!sequenceId) {
      return [];
    }
    const { data: res } = await this.#api.POST('/v1/emailer_campaigns/{id}/add_contact_ids', {
      params: { path: { id: sequenceId } },
      body: {
        // Duplicated in the body for some reason
        contact_ids: records.map((r) => r.contactId),
        emailer_campaign_id: sequenceId,
        send_email_from_email_account_id: mailboxId,
        userId,
      },
    });

    return await Promise.all(
      records.map(async (record) => {
        let contact = res.contacts.find((c) => c.id === record.contactId);
        if (!contact) {
          // Handle situation where contact have already been added to the sequence. However still accounting for
          // other errors where contact could not be added to sequence
          contact = await this.#api
            .GET('/v1/contacts/{id}', { params: { path: { id: record.contactId } } })
            .then((r) => r.data.contact);
        }
        if (!contact) {
          throw new NotFoundError(`Unable to find contact ${record.contactId} in Apollo`);
        }

        // For whatever reason the campaignStatus id seems to be the same
        // across multiple contacts... https://share.cleanshot.com/HKWJ85Ss
        // but there also doesn't seem to be any other unique id we can use...
        const campaignStatus = contact.contact_campaign_statuses.find(
          (status: Record<string, any>) =>
            status.send_email_from_email_account_id === mailboxId && status.emailer_campaign_id === sequenceId
        );
        // Should we issue warnings instead?
        if (!campaignStatus) {
          throw new InternalServerError(`Unable to add contact ${record.contactId} to sequence`);
        }
        return {
          id: campaignStatus.id.toString(),
          record: fromApolloContactCampaignStatusToSequenceState(contact.id, campaignStatus as any),
        };
      })
    );
  }

  async createSequenceState(
    params: SequenceStateCreateParams
  ): Promise<CreateCommonObjectRecordResponse<'sequence_state'>> {
    const res = await this.batchCreateSequenceState([params]);
    return res[0];
  }

  public async batchCreateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    records: Array<EngagementCommonObjectTypeMap<T>['createParams']>
  ): Promise<Array<CreateCommonObjectRecordResponse<T>>> {
    if (commonObjectType === 'sequence_state') {
      return this.batchCreateSequenceState(records as SequenceStateCreateParams[]) as Promise<
        Array<CreateCommonObjectRecordResponse<T>>
      >;
    }
    return Promise.all(records.map((record) => this.createCommonObjectRecord(commonObjectType, record)));
  }

  public override async createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<CreateCommonObjectRecordResponse<T>> {
    // TODO: figure out why type assertion is required here
    switch (commonObjectType) {
      case 'sequence_state':
        return (await this.createSequenceState(
          params as SequenceStateCreateParams
        )) as CreateCommonObjectRecordResponse<T>;
      case 'contact':
        return (await this.createContact(params as ContactCreateParams)) as CreateCommonObjectRecordResponse<T>;
      case 'account':
        return (await this.createAccount(params as AccountCreateParams)) as CreateCommonObjectRecordResponse<T>;
      case 'sequence':
        return (await this.createSequence(params as SequenceCreateParams)) as CreateCommonObjectRecordResponse<T>;
      case 'sequence_step':
        return (await this.createSequenceStep(
          params as SequenceStepCreateParams
        )) as CreateCommonObjectRecordResponse<T>;
      case 'mailbox':
      case 'user':
        throw new BadRequestError(`Create operation not supported for ${commonObjectType} object`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  public override async updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<UpdateCommonObjectRecordResponse<T>> {
    // TODO: figure out why type assertion is required here
    switch (commonObjectType) {
      case 'account':
        return (await this.updateAccount(params as AccountUpdateParams)) as UpdateCommonObjectRecordResponse<T>;
      case 'contact':
        return (await this.updateContact(params as ContactUpdateParams)) as UpdateCommonObjectRecordResponse<T>;
      default:
        throw new BadRequestError(`Update not supported for common object ${commonObjectType}`);
    }
  }

  async updateAccount(params: AccountUpdateParams): Promise<UpdateCommonObjectRecordResponse<'account'>> {
    const response = await axios.put<{ account: Record<string, any> }>(
      `${this.#baseURL}/v1/accounts/${params.id}`,
      { ...toApolloAccountUpdateParams(params), api_key: this.#apiKey },
      {
        headers: this.#headers,
      }
    );
    return {
      id: response.data.account.id,
      record: fromApolloAccountToAccount(response.data.account),
    };
  }

  async updateContact(params: ContactUpdateParams): Promise<UpdateCommonObjectRecordResponse<'contact'>> {
    const response = await axios.put<{ contact: Record<string, any> }>(
      `${this.#baseURL}/v1/contacts/${params.id}`,
      { ...toApolloContactUpdateParams(params), api_key: this.#apiKey },
      {
        headers: this.#headers,
      }
    );
    return {
      id: response.data.contact.id,
      record: fromApolloContactToContact(response.data.contact),
    };
  }

  public override async handleErr(err: unknown): Promise<unknown> {
    const error = err as any;
    if (error.message === 'Request failed with status code 401') {
      return new SGConnectionNoLongerAuthenticatedError(error.message, error);
    }

    return error;
  }
}

export function newClient(connection: ConnectionUnsafe<'apollo'>, provider: Provider): ApolloClient {
  return new ApolloClient(connection.credentials.apiKey);
}

// Apollo only supports API Key based connections.
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
  // Using >= here to cover the case when there are no results: total_pages = 0 and page = 1
  if (pageAsNum >= pagination.total_pages) {
    return;
  }
  return pageAsNum + 1;
}
