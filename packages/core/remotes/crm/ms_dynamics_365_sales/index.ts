// fetch methods / types not present in @types/node yet
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import { ConnectionUnsafe, CRMProvider } from '@supaglue/types';
import {
  AccountV2,
  ContactV2,
  CRMCommonModelType,
  CRMCommonModelTypeMap,
  LeadV2,
  OpportunityV2,
} from '@supaglue/types/crm';
import { o, OHandler } from 'odata';
import querystring from 'querystring';
import simpleOauth2 from 'simple-oauth2';
import { Readable } from 'stream';
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  NotModifiedError,
  UnauthorizedError,
} from '../../../errors';
import { paginator } from '../../utils/paginator';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';
import {
  fromDynamicsAccountToRemoteAccount,
  fromDynamicsContactToRemoteContact,
  fromDynamicsLeadToRemoteLead,
  fromDynamicsOpportunityToRemoteOpportunity,
  fromDynamicsUserToRemoteUser,
} from './mappers';

const MAX_PAGE_SIZE = 1000;

export type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
};

class MsDynamics365Sales extends AbstractCrmRemoteClient {
  #headers = {
    'OData-MaxVersion': '4.0',
    'OData-Version': '4.0',
    'Content-Type': 'application/json',
    Prefer: `odata.maxpagesize=${MAX_PAGE_SIZE}`,
    Authorization: '',
  };
  #odata: OHandler;
  readonly #credentials: Credentials;

  public constructor(credentials: Credentials) {
    super(`${credentials.instanceUrl}api/data/v9.2/`);
    this.#credentials = credentials;
    this.#headers.Authorization = `Bearer ${this.#credentials.accessToken}`;
    this.#odata = o(this.baseUrl, { headers: this.#headers });
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    const oauthClient = new simpleOauth2.AuthorizationCode({
      client: {
        id: this.#credentials.clientId,
        secret: this.#credentials.clientSecret,
      },
      auth: {
        tokenHost: authConfig.tokenHost,
        tokenPath: authConfig.tokenPath,
        authorizePath: authConfig.authorizePath,
      },
    });
    const token = oauthClient.createToken({
      refresh_token: this.#credentials.refreshToken,
      expires_at: this.#credentials.expiresAt,
    });

    if (token.expired()) {
      const newToken = await token.refresh();

      const newAccessToken = newToken.token.access_token as string;
      const newExpiresAt = (newToken.token.expires_at as Date).toISOString();

      this.#credentials.accessToken = newAccessToken;
      this.#credentials.expiresAt = newExpiresAt;

      this.#headers.Authorization = `Bearer ${newAccessToken}`;

      this.emit('token_refreshed', newAccessToken, newExpiresAt);
    }
  }

  private getUrlForEntityAndParams(entity: string, params: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${entity}`);
    // we can't use URLSearchParams because odata doesn't expect the keys to be urlencoded
    url.search = querystring.stringify(
      Object.fromEntries(Object.entries(params).filter(([_, v]) => Boolean(v))), // filter out empty values
      '&',
      '=',
      {
        encodeURIComponent: (s) =>
          s.startsWith('$') // don't encode keys that start with `$`
            ? s
            : querystring.escape(s),
      }
    );
    return url.toString();
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.#headers;
  }

  public override async listCommonModelRecords(
    commonModelType: CRMCommonModelType,
    updatedAfter?: Date
  ): Promise<Readable> {
    switch (commonModelType) {
      case 'account':
        return await this.listAccounts(updatedAfter);
      case 'contact':
        return await this.listContacts(updatedAfter);
      case 'lead':
        return await this.listLeads(updatedAfter);
      case 'opportunity':
        return await this.listOpportunities(updatedAfter);
      case 'user':
        return await this.listUsers(updatedAfter);
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async getCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    switch (commonModelType) {
      case 'account':
        return this.getAccount(id);
      case 'contact':
        return this.getContact(id);
      case 'lead':
        return this.getLead(id);
      case 'opportunity':
        return this.getOpportunity(id);
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async createCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }

  public override async updateCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }

  private async getAccount(id: string): Promise<AccountV2> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsAccountToRemoteAccount(
      await this.#odata.get('accounts').query({ $filter: `accountid eq '${id}'` })
    );
  }

  private async getContact(id: string): Promise<ContactV2> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsContactToRemoteContact(
      await this.#odata.get('contacts').query({ $filter: `contactid eq '${id}'` })
    );
  }

  private async getLead(id: string): Promise<LeadV2> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsLeadToRemoteLead(await this.#odata.get('leads').query({ $filter: `leadid eq '${id}'` }));
  }

  private async getOpportunity(id: string): Promise<OpportunityV2> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsOpportunityToRemoteOpportunity(
      await this.#odata.get('opportunities').query({ $filter: `opportunityid eq '${id}'` })
    );
  }

  private getListFetcherForEntity(
    entity: string,
    updatedAfter?: Date,
    expand?: string
  ): (nextUrl?: string) => Promise<any> {
    return async (nextUrl?: string) => {
      await this.maybeRefreshAccessToken();
      // NOTE: we don't use the odata client here as it doesn't handle pagination
      const response = await fetch(
        nextUrl ||
          this.getUrlForEntityAndParams(entity, {
            $filter: updatedAfter ? `modifiedon gt ${updatedAfter?.toISOString()}` : undefined,
            $expand: expand,
          }),
        { headers: this.#headers }
      );
      if (!response.ok) {
        throw this.handleErr(response);
      }
      return await response.json();
    };
  }

  private async listAccounts(updatedAfter?: Date): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('accounts', updatedAfter),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({ record: fromDynamicsAccountToRemoteAccount(result), emittedAt }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  private async listContacts(updatedAfter?: Date): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('contacts', updatedAfter),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({ record: fromDynamicsContactToRemoteContact(result), emittedAt }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  private async listOpportunities(updatedAfter?: Date): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity(
          'opportunities',
          updatedAfter,
          'stageid_processstage($select=stagename),opportunity_leadtoopportunitysalesprocess($select=name)'
        ),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({
              record: fromDynamicsOpportunityToRemoteOpportunity(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  private async listLeads(updatedAfter?: Date): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('leads', updatedAfter),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({
              record: fromDynamicsLeadToRemoteLead(result),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  private async listUsers(updatedAfter?: Date): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('systemusers', updatedAfter),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({ record: fromDynamicsUserToRemoteUser(result), emittedAt }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  public handleErr(err: unknown): unknown {
    if (err instanceof Response) {
      switch (err.status) {
        case 400:
          return new BadRequestError(err.statusText);
        case 401:
          return new UnauthorizedError(err.statusText);
        case 403:
          return new ForbiddenError(err.statusText);
        case 404:
          return new NotFoundError(err.statusText);
        case 304:
          return new NotModifiedError(err.statusText);
        default:
          return new InternalServerError(err.statusText);
      }
    }
    return err;
  }
}

export function newClient(
  connection: ConnectionUnsafe<'ms_dynamics_365_sales'>,
  provider: CRMProvider
): MsDynamics365Sales {
  return new MsDynamics365Sales({
    ...connection.credentials,
    instanceUrl: connection.instanceUrl,
    clientId: provider.config.oauth.credentials.oauthClientId,
    clientSecret: provider.config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://login.microsoftonline.com',
  tokenPath: '/common/oauth2/v2.0/token',
  authorizeHost: 'https://login.microsoftonline.com',
  authorizePath: '/common/oauth2/v2.0/authorize',
  additionalScopes: ['offline_access'],
};
