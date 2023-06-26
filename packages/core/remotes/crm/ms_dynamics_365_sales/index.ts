// fetch methods / types not present in @types/node yet
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import { ConnectionUnsafe, CRMProvider } from '@supaglue/types';
import {
  Account,
  Contact,
  CRMCommonModelType,
  CRMCommonModelTypeMap,
  Lead,
  Opportunity,
  User,
} from '@supaglue/types/crm';
import { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { o, OHandler } from 'odata';
import { plural } from 'pluralize';
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
  toDynamicsAccountCreateParams,
  toDynamicsAccountUpdateParams,
  toDynamicsContactCreateParams,
  toDynamicsContactUpdateParams,
  toDynamicsLeadCreateParams,
  toDynamicsLeadUpdateParams,
  toDynamicsOpportunityCreateParams,
  toDynamicsOpportunityUpdateParams,
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
    this.#odata = o(this.baseUrl, { headers: this.#headers, referrer: undefined });
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
      this.#odata = o(this.baseUrl, { headers: this.#headers, referrer: undefined });

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

  public override async listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const idkey = `${object}id`;
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity(plural(object), updatedAfter, undefined, heartbeat),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({
              id: result[idkey],
              rawData: result,
              isDeleted: false,
              lastModifiedAt: new Date(result.modifiedon),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  public override async listCommonObjectRecords(
    commonModelType: CRMCommonModelType,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    switch (commonModelType) {
      case 'account':
        return await this.listAccounts(updatedAfter, heartbeat);
      case 'contact':
        return await this.listContacts(updatedAfter, heartbeat);
      case 'lead':
        return await this.listLeads(updatedAfter, heartbeat);
      case 'opportunity':
        return await this.listOpportunities(updatedAfter, heartbeat);
      case 'user':
        return await this.listUsers(updatedAfter, heartbeat);
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async getCommonObjectRecord<T extends CRMCommonModelType>(
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
      case 'user':
        return await this.getUser(id);
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async createCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    await this.maybeRefreshAccessToken();
    switch (commonModelType) {
      case 'account': {
        const response = await this.#odata.post('accounts', toDynamicsAccountCreateParams(params)).query();
        const id = response.headers.get('location')?.split('(')[1].split(')')[0];
        return id;
      }
      case 'contact': {
        const response = await this.#odata.post('contacts', toDynamicsContactCreateParams(params)).query();
        const id = response.headers.get('location')?.split('(')[1].split(')')[0];
        return id;
      }
      case 'lead': {
        const response = await this.#odata.post('leads', toDynamicsLeadCreateParams(params)).query();
        const id = response.headers.get('location')?.split('(')[1].split(')')[0];
        return id;
      }
      case 'opportunity': {
        const response = await this.#odata.post('opportunities', toDynamicsOpportunityCreateParams(params)).query();
        const id = response.headers.get('location')?.split('(')[1].split(')')[0];
        return id;
      }
      case 'user':
        throw new Error('Cannot create users in MS Dynamics 365');
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  public override async updateCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<string> {
    await this.maybeRefreshAccessToken();
    switch (commonModelType) {
      case 'account': {
        await this.#odata.patch(`accounts(${params.id})`, toDynamicsAccountUpdateParams(params)).query();
        return params.id;
      }
      case 'contact': {
        await this.#odata.patch(`contacts(${params.id})`, toDynamicsContactUpdateParams(params)).query();
        return params.id;
      }
      case 'lead': {
        await this.#odata.patch(`leads(${params.id})`, toDynamicsLeadUpdateParams(params)).query();
        return params.id;
      }
      case 'opportunity': {
        await this.#odata.patch(`opportunities(${params.id})`, toDynamicsOpportunityUpdateParams(params)).query();
        return params.id;
      }
      case 'user':
        throw new Error('Cannot update users in MS Dynamics 365');
      default:
        throw new Error(`Unsupported common model type: ${commonModelType}`);
    }
  }

  private async getAccount(id: string): Promise<Account> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsAccountToRemoteAccount(
      (await this.#odata.get('accounts').query({ $filter: `accountid eq '${id}'` }))[0]
    );
  }

  private async getContact(id: string): Promise<Contact> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsContactToRemoteContact(
      (await this.#odata.get('contacts').query({ $filter: `contactid eq '${id}'` }))[0]
    );
  }

  private async getLead(id: string): Promise<Lead> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsLeadToRemoteLead((await this.#odata.get('leads').query({ $filter: `leadid eq '${id}'` }))[0]);
  }

  private async getOpportunity(id: string): Promise<Opportunity> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsOpportunityToRemoteOpportunity(
      (await this.#odata.get('opportunities').query({ $filter: `opportunityid eq '${id}'` }))[0]
    );
  }

  private async getUser(id: string): Promise<User> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsUserToRemoteUser(
      (await this.#odata.get('systemusers').query({ $filter: `systemuserid eq '${id}'` }))[0]
    );
  }

  private getListFetcherForEntity(
    entity: string,
    updatedAfter?: Date,
    expand?: string,
    heartbeat?: () => void
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
      if (heartbeat) {
        heartbeat();
      }
      if (!response.ok) {
        throw this.handleErr(response);
      }
      return await response.json();
    };
  }

  private async listAccounts(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('accounts', updatedAfter, undefined, heartbeat),
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

  private async listContacts(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('contacts', updatedAfter, undefined, heartbeat),
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

  private async listOpportunities(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity(
          'opportunities',
          updatedAfter,
          'stageid_processstage($select=stagename),opportunity_leadtoopportunitysalesprocess($select=name)',
          heartbeat
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

  private async listLeads(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('leads', updatedAfter, undefined, heartbeat),
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

  private async listUsers(updatedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('systemusers', updatedAfter, undefined, heartbeat),
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
