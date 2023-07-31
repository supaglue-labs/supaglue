// fetch methods / types not present in @types/node yet
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import type { ConnectionUnsafe, CRMProvider, Provider } from '@supaglue/types';
import type {
  Account,
  Contact,
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  Lead,
  Opportunity,
  User,
} from '@supaglue/types/crm';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { OHandler } from 'odata';
import { o } from 'odata';
import { plural } from 'pluralize';
import querystring from 'querystring';
import simpleOauth2 from 'simple-oauth2';
import { Readable } from 'stream';
import {
  BadGatewayError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  NotModifiedError,
  UnauthorizedError,
} from '../../../errors';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';
import { paginator } from '../../utils/paginator';
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
      const newRefreshToken = newToken.token.refresh_token as string;
      const newExpiresAt = (newToken.token.expires_at as Date).toISOString();

      this.#credentials.accessToken = newAccessToken;
      this.#credentials.refreshToken = newRefreshToken;
      this.#credentials.expiresAt = newExpiresAt;

      this.#headers.Authorization = `Bearer ${newAccessToken}`;
      this.#odata = o(this.baseUrl, { headers: this.#headers, referrer: undefined });

      this.emit('token_refreshed', {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: newExpiresAt,
      });
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
    fieldsToFetch: FieldsToFetch,
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
              mappedData: result,
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
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'account':
        return await this.listAccounts(fieldMappingConfig, updatedAfter, heartbeat);
      case 'contact':
        return await this.listContacts(fieldMappingConfig, updatedAfter, heartbeat);
      case 'lead':
        return await this.listLeads(fieldMappingConfig, updatedAfter, heartbeat);
      case 'opportunity':
        return await this.listOpportunities(fieldMappingConfig, updatedAfter, heartbeat);
      case 'user':
        return await this.listUsers(fieldMappingConfig, updatedAfter, heartbeat);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async getCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    id: string,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    switch (commonObjectType) {
      case 'account':
        return this.getAccount(id, fieldMappingConfig);
      case 'contact':
        return this.getContact(id, fieldMappingConfig);
      case 'lead':
        return this.getLead(id, fieldMappingConfig);
      case 'opportunity':
        return this.getOpportunity(id, fieldMappingConfig);
      case 'user':
        return await this.getUser(id, fieldMappingConfig);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async createCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    await this.maybeRefreshAccessToken();
    switch (commonObjectType) {
      case 'account': {
        const response = await this.#odata.post('accounts', toDynamicsAccountCreateParams(params)).query();
        const id = response.headers.get('location')?.split('(')?.[1]?.split(')')?.[0];
        return id;
      }
      case 'contact': {
        const response = await this.#odata.post('contacts', toDynamicsContactCreateParams(params)).query();
        const id = response.headers.get('location')?.split('(')?.[1]?.split(')')?.[0];
        return id;
      }
      case 'lead': {
        const response = await this.#odata.post('leads', toDynamicsLeadCreateParams(params)).query();
        const id = response.headers.get('location')?.split('(')?.[1]?.split(')')?.[0];
        return id;
      }
      case 'opportunity': {
        const response = await this.#odata.post('opportunities', toDynamicsOpportunityCreateParams(params)).query();
        const id = response.headers.get('location')?.split('(')?.[1]?.split(')')?.[0];
        return id;
      }
      case 'user':
        throw new Error('Cannot create users in MS Dynamics 365');
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async updateCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<string> {
    await this.maybeRefreshAccessToken();
    switch (commonObjectType) {
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
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async getUserId(): Promise<string | undefined> {
    await this.maybeRefreshAccessToken();
    const { accessToken } = this.#credentials;
    const jwtTokenParts = accessToken.split('.');
    const jwtTokenPayload = JSON.parse(Buffer.from(jwtTokenParts[1], 'base64').toString('utf-8'));
    const activeDirectoryUserId = jwtTokenPayload.oid;
    return await this.getUserIdForActiveDirectoryUserId(activeDirectoryUserId);
  }

  private async getUserIdForActiveDirectoryUserId(activeDirectoryUserId: string): Promise<string | undefined> {
    await this.maybeRefreshAccessToken();

    const response = await this.#odata.get('systemusers').query({
      $filter: `azureactivedirectoryobjectid eq '${activeDirectoryUserId}'`,
      $select: 'systemuserid,azureactivedirectoryobjectid',
    });
    return response[0]?.systemuserid;
  }

  private async getAccount(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Account> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsAccountToRemoteAccount(
      (await this.#odata.get('accounts').query({ $filter: `accountid eq '${id}'` }))[0],
      fieldMappingConfig
    );
  }

  private async getContact(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Contact> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsContactToRemoteContact(
      (await this.#odata.get('contacts').query({ $filter: `contactid eq '${id}'` }))[0],
      fieldMappingConfig
    );
  }

  private async getLead(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Lead> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsLeadToRemoteLead(
      (await this.#odata.get('leads').query({ $filter: `leadid eq '${id}'` }))[0],
      fieldMappingConfig
    );
  }

  private async getOpportunity(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Opportunity> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsOpportunityToRemoteOpportunity(
      (await this.#odata.get('opportunities').query({ $filter: `opportunityid eq '${id}'` }))[0],
      fieldMappingConfig
    );
  }

  private async getUser(id: string, fieldMappingConfig: FieldMappingConfig): Promise<User> {
    await this.maybeRefreshAccessToken();
    return fromDynamicsUserToRemoteUser(
      (await this.#odata.get('systemusers').query({ $filter: `systemuserid eq '${id}'` }))[0],
      fieldMappingConfig
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

  private async listAccounts(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('accounts', updatedAfter, undefined, heartbeat),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({
              record: fromDynamicsAccountToRemoteAccount(result, fieldMappingConfig),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  private async listContacts(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('contacts', updatedAfter, undefined, heartbeat),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({
              record: fromDynamicsContactToRemoteContact(result, fieldMappingConfig),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  private async listOpportunities(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
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
              record: fromDynamicsOpportunityToRemoteOpportunity(result, fieldMappingConfig),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  private async listLeads(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('leads', updatedAfter, undefined, heartbeat),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({
              record: fromDynamicsLeadToRemoteLead(result, fieldMappingConfig),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  private async listUsers(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('systemusers', updatedAfter, undefined, heartbeat),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({
              record: fromDynamicsUserToRemoteUser(result, fieldMappingConfig),
              emittedAt,
            }))
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  public override handleErr(err: unknown): unknown {
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

    if (isErrnoException(err)) {
      switch (err.code) {
        case 'ENOTFOUND':
        case 'ECONNREFUSED':
          return new BadGatewayError(`Could not connect to remote CRM: ${err.message}`);
        default:
          return err;
      }
    }
    return err;
  }
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  const err = error as any;
  return (
    (typeof err.errno === 'number' || typeof err.errno === 'undefined') &&
    (typeof err.code === 'string' || typeof err.code === 'undefined') &&
    (typeof err.path === 'string' || typeof err.path === 'undefined') &&
    (typeof err.syscall === 'string' || typeof err.syscall === 'undefined')
  );
}

export function newClient(
  connection: ConnectionUnsafe<'ms_dynamics_365_sales'>,
  provider: Provider
): MsDynamics365Sales {
  return new MsDynamics365Sales({
    ...connection.credentials,
    instanceUrl: connection.instanceUrl,
    clientId: (provider as CRMProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as CRMProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://login.microsoftonline.com',
  tokenPath: '/common/oauth2/v2.0/token',
  authorizeHost: 'https://login.microsoftonline.com',
  authorizePath: '/common/oauth2/v2.0/authorize',
  additionalScopes: ['offline_access'],
};
