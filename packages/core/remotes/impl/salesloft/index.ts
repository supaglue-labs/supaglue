import axios, { AxiosError } from '@supaglue/core/remotes/sg_axios';
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
  AccountSearchParams,
  AccountUpsertParams,
  Contact,
  ContactCreateParams,
  ContactSearchParams,
  EngagementCommonObjectType,
  EngagementCommonObjectTypeMap,
  EngagementListParams,
  SequenceCreateParams,
  SequenceState,
  SequenceStateCreateParams,
  SequenceStateSearchParams,
  SequenceStepCreateParams,
  User,
} from '@supaglue/types/engagement';
import { Readable } from 'stream';
import {
  BadRequestError,
  InternalServerError,
  RemoteProviderError,
  SGConnectionNoLongerAuthenticatedError,
} from '../../../errors';
import type { PaginatedSupaglueRecords } from '../../../lib';
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  encodeCursor,
  REFRESH_TOKEN_THRESHOLD_MS,
  retryWhenAxiosRateLimited,
} from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import type {
  CreateCommonObjectRecordResponse,
  UpdateCommonObjectRecordResponse,
  UpsertCommonObjectRecordResponse,
} from '../../categories/engagement/base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';
import { paginator } from '../../utils/paginator';
import {
  fromSalesloftAccountToAccount,
  fromSalesloftCadenceMembershipToSequenceState,
  fromSalesloftCadenceToSequence,
  fromSalesloftPersonToContact,
  fromSalesloftUserToUser,
  toSalesloftAccountCreateParams,
  toSalesloftCadenceImportParams,
  toSalesloftCadenceStepImportParams,
  toSalesloftContactCreateParams,
  toSalesloftSequenceStateCreateParams,
} from './mappers';
import { createSalesloftClient } from './salesloft.client';

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

class SalesloftClient extends AbstractEngagementRemoteClient {
  readonly #credentials: Credentials;
  #headers: Record<string, string>;
  readonly #baseURL: string;
  readonly #api: ReturnType<typeof createSalesloftClient>;

  public constructor(credentials: Credentials) {
    super('https://api.salesloft.com');
    this.#baseURL = 'https://api.salesloft.com';
    this.#credentials = credentials;
    this.#headers = { Authorization: `Bearer ${this.#credentials.accessToken}` };
    this.#api = createSalesloftClient({
      credentials: this.#credentials,
      onTokenRefreshed: (tokens) => this.emit('token_refreshed', tokens),
    });
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.#headers;
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (
      !this.#credentials.expiresAt ||
      Date.parse(this.#credentials.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS
    ) {
      try {
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
        this.#headers = { Authorization: `Bearer ${newAccessToken}` };

        this.emit('token_refreshed', {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresAt: newExpiresAt,
        });
      } catch (e: any) {
        if (e.response?.status === 400) {
          throw new SGConnectionNoLongerAuthenticatedError('Unable to refresh access token. Refresh token invalid.');
        }
        throw e;
      }
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
        return await this.#getRecord<User>(id, '/v2/users', (r: any) => fromSalesloftUserToUser(r));
      case 'account':
        return await this.#getRecord<Account>(id, '/v2/accounts', fromSalesloftAccountToAccount);
      case 'sequence': {
        const params = { path: { id } };
        const [cadence, stepCount, cadenceExport] = await Promise.all([
          this.#api.GET('/v2/cadences/{id}.json', { params }),
          this.#getCadenceStepCount(id),
          this.#api.GET('/v2/cadence_exports/{id}', { params }),
        ]);
        return fromSalesloftCadenceToSequence(cadence.data.data, stepCount, cadenceExport.data.data);
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

  #getListRecordsFetcher(
    endpoint: string,
    updatedAfter?: Date,
    heartbeat?: () => void,
    pageSize = SALESLOFT_RECORD_LIMIT
  ): (next?: string) => Promise<SalesloftPaginatedRecords> {
    return async (next?: string) => {
      return await retryWhenAxiosRateLimited(
        async () => {
          if (heartbeat) {
            heartbeat();
          }
          await this.maybeRefreshAccessToken();
          const response = await axios.get<SalesloftPaginatedRecords>(endpoint, {
            params: updatedAfter
              ? {
                  ...DEFAULT_LIST_PARAMS,
                  ...getUpdatedAfterPathParam(updatedAfter),
                  page: next ? parseInt(next) : undefined,
                }
              : {
                  ...DEFAULT_LIST_PARAMS,
                  page: next ? parseInt(next) : undefined,
                },
            headers: this.#headers,
          });
          return response.data;
        },
        // the rate limit is 600/minute shared among all users of the API, so we should wait longer than the usual 1s just to be safe
        { retries: 3, minTimeout: 10_000, maxTimeout: 60_000, factor: 3, randomize: true }
      );
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

  async #getCadenceStepCounts(heartbeat?: () => void): Promise<Record<string, number>> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}/v2/steps`, undefined, heartbeat);
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

  private async streamSequences(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    const stepCounts = await this.#getCadenceStepCounts(heartbeat);
    return await this.#streamRecords(
      '/v2/cadences',
      (data: any) => fromSalesloftCadenceToSequence(data, stepCounts[data.id?.toString()] ?? 0),
      updatedAfter,
      heartbeat
    );
  }

  public override async listCommonObjectRecords<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['listParams']
  ): Promise<PaginatedSupaglueRecords<EngagementCommonObjectTypeMap<T>['object']>> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#listRecords(`/v2/people`, fromSalesloftPersonToContact, params);
      case 'user':
        return await this.#listRecords(`/v2/users`, (r: any) => fromSalesloftUserToUser(r), params);
      case 'account':
        return await this.#listRecords(`/v2/accounts`, fromSalesloftAccountToAccount, params);
      case 'sequence_state':
        return await this.#listRecords(
          '/v2/cadence_memberships',
          fromSalesloftCadenceMembershipToSequenceState,
          params
        );
      case 'sequence': {
        const stepCounts = await this.#getCadenceStepCounts();
        return await this.#listRecords(
          '/v2/cadences',
          (data: any) => fromSalesloftCadenceToSequence(data, stepCounts[data.id?.toString()] ?? 0),
          params
        );
      }
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported for salesloft`);
    }
  }

  async #listRecords<T>(
    path: string,
    mapper: (record: Record<string, any>) => T,
    params: EngagementListParams
  ): Promise<PaginatedSupaglueRecords<T>> {
    const cursor = decodeCursor(params.cursor);
    const records = await this.#getListRecordsFetcher(
      `${this.#baseURL}${path}`,
      params.modifiedAfter,
      /* heartbeat */ undefined,
      params.pageSize ?? DEFAULT_PAGE_SIZE
    )(cursor?.id as string | undefined);
    return {
      records: records.data.map(mapper),
      pagination: {
        total_count: records.metadata.paging?.total_count,
        previous: records.metadata.paging?.prev_page
          ? encodeCursor({ id: records.metadata.paging?.prev_page, reverse: true })
          : null,
        next: records.metadata.paging?.next_page
          ? encodeCursor({ id: records.metadata.paging?.next_page, reverse: false })
          : null,
      },
    };
  }

  async #streamRecords<T>(
    path: string,
    mapper: (data: Record<string, any>) => T,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const normalPageFetcher = this.#getListRecordsFetcher(`${this.#baseURL}${path}`, updatedAfter, heartbeat);
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

  public override async streamCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#streamRecords(`/v2/people`, fromSalesloftPersonToContact, updatedAfter, heartbeat);
      case 'user':
        return await this.#streamRecords(`/v2/users`, (r: any) => fromSalesloftUserToUser(r), updatedAfter, heartbeat);
      case 'account':
        return await this.#streamRecords(`/v2/accounts`, fromSalesloftAccountToAccount, updatedAfter, heartbeat);
      case 'sequence':
        return await this.streamSequences(updatedAfter, heartbeat);
      case 'mailbox':
        return Readable.from([]);
      case 'sequence_state':
        return await this.#streamRecords(
          '/v2/cadence_memberships',
          fromSalesloftCadenceMembershipToSequenceState,
          updatedAfter,
          heartbeat
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

  async #importSequence(params: SequenceCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();
    const response = await axios.post<{ data: { cadence: { id: number } } }>(
      `${this.#baseURL}/v2/cadence_imports`,
      toSalesloftCadenceImportParams(params),
      { headers: this.#headers }
    );
    return response.data.data.cadence.id.toString();
  }

  async #importSequenceStep(params: SequenceStepCreateParams): Promise<string> {
    await this.maybeRefreshAccessToken();

    const response = await axios.post<{ data: { cadence: { id: number } } }>(
      `${this.#baseURL}/v2/cadence_imports`,
      toSalesloftCadenceStepImportParams(params),
      { headers: this.#headers }
    );
    // TODO: The response does not contain step Id... So the return value is only the cadence ID
    // Should we do a fetch on the cadence instead? But the problem is we also don't have a way to
    // definitively idenfiy the step we just created
    return response.data.data.cadence.id.toString();
  }

  public override async upsertCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['upsertParams']
  ): Promise<UpsertCommonObjectRecordResponse<T>> {
    // TODO: figure out why type assertion is required here
    switch (commonObjectType) {
      case 'account':
        return await this.upsertAccount(params as AccountUpsertParams);
      case 'sequence_state':
      case 'contact':
      case 'sequence':
      case 'sequence_step':
      case 'mailbox':
      case 'user':
        throw new BadRequestError(`Create operation not supported for ${commonObjectType} object`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async upsertAccount(params: AccountUpsertParams): Promise<Promise<{ id: string }>> {
    const { domain, name } = params.upsertOn;

    if (!domain && !name) {
      throw new BadRequestError('Must specify at least one upsertOn field');
    }

    const searchResult = await this.#searchAccounts({
      filter: {
        domain: domain,
        name: name,
      },
    });

    if (searchResult.records.length > 1) {
      throw new BadRequestError('More than one account found for upsertOn fields');
    }
    if (searchResult.records.length) {
      return this.updateCommonObjectRecord('account', { ...params.record, id: searchResult.records[0].id.toString() });
    }
    return this.createCommonObjectRecord('account', params.record);
  }

  public override async createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<CreateCommonObjectRecordResponse<T>> {
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
        return { id: await this.#importSequence(params as SequenceCreateParams) };
      case 'sequence_step':
        return { id: await this.#importSequenceStep(params as SequenceStepCreateParams) };
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
  ): Promise<UpdateCommonObjectRecordResponse<T>> {
    switch (commonObjectType) {
      case 'account':
        return {
          id: await this.#updateRecord(
            (params as EngagementCommonObjectTypeMap<'account'>['updateParams']).id,
            '/v2/accounts',
            toSalesloftAccountCreateParams(params as AccountCreateParams)
          ),
        };
      case 'contact':
        return {
          id: await this.#updateRecord(
            (params as EngagementCommonObjectTypeMap<'contact'>['updateParams']).id,
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

  public override async searchCommonObjectRecords<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['searchParams']
  ): Promise<PaginatedSupaglueRecords<EngagementCommonObjectTypeMap<T>['object']>> {
    switch (commonObjectType) {
      case 'contact':
        return await this.#searchContacts(params as ContactSearchParams);
      case 'sequence_state':
        return await this.#searchSequenceStates(params as SequenceStateSearchParams);
      case 'account':
        return await this.#searchAccounts(params as AccountSearchParams);
      case 'user':
      case 'mailbox':
      case 'sequence':
        throw new BadRequestError(`Search operation not supported for common object ${commonObjectType} in Salesloft`);
      default:
        throw new BadRequestError(`Common object ${commonObjectType} not supported`);
    }
  }

  async #searchAccounts(params: AccountSearchParams): Promise<PaginatedSupaglueRecords<Account>> {
    const cursor = params.cursor ? decodeCursor(params.cursor) : undefined;
    const page = cursor?.id as number | undefined;
    const searchParams: Record<string, unknown> = { per_page: params.pageSize ?? SALESLOFT_RECORD_LIMIT, page };
    if (params.filter.name) {
      searchParams.name = [params.filter.name];
    }
    if (params.filter.domain) {
      searchParams.domain = params.filter.domain;
    }
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await axios.get<SalesloftPaginatedRecords>(`${this.#baseURL}/v2/accounts`, {
        params: searchParams,
        headers: this.getAuthHeadersForPassthroughRequest(),
      });
      const records = response.data.data.map(fromSalesloftAccountToAccount);
      return {
        records,
        pagination: {
          total_count: records.length,
          previous: response.data.metadata.paging?.prev_page
            ? encodeCursor({ id: response.data.metadata.paging.prev_page, reverse: true })
            : null,
          next: response.data.metadata.paging?.next_page
            ? encodeCursor({ id: response.data.metadata.paging.next_page, reverse: false })
            : null,
        },
      };
    });
  }
  async #searchContacts(params: ContactSearchParams): Promise<PaginatedSupaglueRecords<Contact>> {
    const cursor = params.cursor ? decodeCursor(params.cursor) : undefined;
    const page = cursor?.id as number | undefined;
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await axios.get<SalesloftPaginatedRecords>(`${this.#baseURL}/v2/people`, {
        params: {
          ...DEFAULT_LIST_PARAMS,
          per_page: params.pageSize,
          page,
          email_addresses: params.filter.emails,
        },
        headers: this.getAuthHeadersForPassthroughRequest(),
      });
      const records = response.data.data.map(fromSalesloftPersonToContact);
      return {
        records,
        pagination: {
          total_count: records.length,
          previous: response.data.metadata.paging?.prev_page
            ? encodeCursor({ id: response.data.metadata.paging.prev_page, reverse: true })
            : null,
          next: response.data.metadata.paging?.next_page
            ? encodeCursor({ id: response.data.metadata.paging.next_page, reverse: false })
            : null,
        },
      };
    });
  }

  async #searchSequenceStates(params: SequenceStateSearchParams): Promise<PaginatedSupaglueRecords<SequenceState>> {
    const cursor = params.cursor ? decodeCursor(params.cursor) : undefined;
    const page = cursor?.id as number | undefined;
    return await retryWhenAxiosRateLimited(async () => {
      await this.maybeRefreshAccessToken();
      const response = await axios.get<SalesloftPaginatedRecords>(`${this.#baseURL}/v2/cadence_memberships`, {
        params: {
          ...DEFAULT_LIST_PARAMS,
          per_page: params.pageSize,
          page,
          person_id: params.filter.contactId,
          cadence_id: params.filter.sequenceId,
        },
        headers: this.getAuthHeadersForPassthroughRequest(),
      });
      const records = response.data.data.map(fromSalesloftCadenceMembershipToSequenceState);
      return {
        records,
        pagination: {
          previous: response.data.metadata.paging?.prev_page
            ? encodeCursor({ id: response.data.metadata.paging.prev_page, reverse: true })
            : null,
          next: response.data.metadata.paging?.next_page
            ? encodeCursor({ id: response.data.metadata.paging.next_page, reverse: false })
            : null,
        },
      };
    });
  }

  public override async handleErr(err: unknown): Promise<unknown> {
    if (!(err instanceof AxiosError)) {
      return err;
    }

    // https://developers.salesloft.com/docs/platform/api-basics/request-response-format
    const errorTitle = err.response?.data?.error ?? err.response?.statusText;
    const errorCause = err.response?.data;

    switch (err.response?.status) {
      case 400:
        return new InternalServerError(errorTitle, errorCause);
      // The following are unmapped to Supaglue errors, but we want to pass
      // them back as 4xx so they aren't 500 and developers can view error messages
      // NOTE: `429` is omitted below since we process it differently for syncs
      case 401:
      case 402:
      case 403:
      case 404:
      case 405:
      case 406:
      case 407:
      case 408:
      case 410:
      case 411:
      case 412:
      case 413:
      case 414:
      case 415:
      case 416:
      case 417:
      case 418:
      case 419:
      case 420:
      case 421:
      case 422:
      case 423:
      case 424:
      case 425:
      case 426:
      case 427:
      case 428:
      case 430:
      case 431:
      case 432:
      case 433:
      case 434:
      case 435:
      case 436:
      case 437:
      case 438:
      case 439:
      case 440:
      case 441:
      case 442:
      case 443:
      case 444:
      case 445:
      case 446:
      case 447:
      case 448:
      case 449:
      case 450:
      case 451:
        return new RemoteProviderError(errorTitle, errorCause);
      default:
        return err;
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
