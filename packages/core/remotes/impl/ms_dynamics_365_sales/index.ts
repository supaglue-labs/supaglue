// fetch methods / types not present in @types/node yet
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import type {
  ConnectionUnsafe,
  CRMProvider,
  ListedObjectRecord,
  ObjectRecordUpsertData,
  ObjectRecordWithMetadata,
  Property,
  PropertyUnified,
  Provider,
  RemoteUserIdAndDetails,
  StandardOrCustomObjectDef,
} from '@supaglue/types';
import type {
  Account,
  Contact,
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  CrmListParams,
  Lead,
  Opportunity,
  User,
} from '@supaglue/types/crm';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { StandardOrCustomObject } from '@supaglue/types/standard_or_custom_object';
import type { OHandler } from 'odata';
import { o } from 'odata';
import { plural } from 'pluralize';
import querystring from 'querystring';
import simpleOauth2 from 'simple-oauth2';
import { Readable } from 'stream';
import {
  BadGatewayError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  NotModifiedError,
  RemoteProviderError,
  SGConnectionNoLongerAuthenticatedError,
  UnauthorizedError,
} from '../../../errors';
import type { PaginatedSupaglueRecords } from '../../../lib/pagination';
import { decodeCursor, DEFAULT_PAGE_SIZE, encodeCursor } from '../../../lib/pagination';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';
import { paginator } from '../../utils/paginator';
import {
  fromAttributeToPropertyUnified,
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

  public override async streamStandardObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const idkey = `${object}id`;

    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity(plural(object), fieldsToFetch, updatedAfter, undefined, heartbeat),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => {
              const ret: ListedObjectRecord = {
                id: result[idkey],
                rawData: result,
                rawProperties: result,
                isDeleted: false,
                lastModifiedAt: new Date(result.modifiedon),
                emittedAt,
              };
              return ret;
            })
          );
        },
        getNextCursorFromPage: (response) => response['@odata.nextLink'],
      },
    ]);
  }

  private async getPublisherPrefix(): Promise<string> {
    // get the prefix for the default powerapps publisher
    // the fixed GUID for the default powerapps publisher is 00000001-0000-0000-0000-00000000005a
    // TODO this probably should be more flexible
    await this.maybeRefreshAccessToken();
    return (
      await this.#odata
        .get('publishers(00000001-0000-0000-0000-00000000005a)')
        .query({ $select: 'customizationprefix' })
    )?.customizationprefix;
  }

  public override async streamCustomObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const publisherPrefix = await this.getPublisherPrefix();
    const idkey = `${publisherPrefix}_${object}id`;
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity(
          `${publisherPrefix}_${plural(object)}`,
          fieldsToFetch,
          modifiedAfter,
          undefined,
          heartbeat
        ),
        createStreamFromPage: (response) => {
          const emittedAt = new Date();
          return Readable.from(
            response.value.map((result: any) => ({
              id: result[idkey],
              rawData: result,
              rawProperties: result,
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

  public override async createObjectRecord(
    object: StandardOrCustomObject,
    data: ObjectRecordUpsertData
  ): Promise<string> {
    await this.maybeRefreshAccessToken();
    let objectName = plural(object.name);
    // need our own odata client here as we need to set the `Prefer` header to get the created object id back
    const odata = o(this.baseUrl, {
      headers: { ...this.#headers, Prefer: `return=representation` },
      referrer: undefined,
    });
    if (object.type === 'custom') {
      const publisherPrefix = await this.getPublisherPrefix();
      objectName = `${publisherPrefix}_${objectName}`;
      const objectIdField = `${publisherPrefix}_${object.name}id`;
      // map data to new object with the prefixed field names
      const mappedData = Object.fromEntries(Object.entries(data).map(([k, v]) => [`${publisherPrefix}_${k}`, v]));
      const response = await odata.post(objectName, mappedData).query({ $select: objectIdField });
      return response[objectIdField];
    }
    const response = await odata.post(objectName, data).query({ $select: `${object.name}id` });
    return response[`${object.name}id`];
  }

  public override async getObjectRecord(
    object: StandardOrCustomObject,
    id: string,
    fields: string[]
  ): Promise<ObjectRecordWithMetadata> {
    await this.maybeRefreshAccessToken();
    let objectName = plural(object.name);
    let publisherPrefix: string | undefined;
    if (object.type === 'custom') {
      publisherPrefix = await this.getPublisherPrefix();
      objectName = `${publisherPrefix}_${objectName}`;
    }
    const response = await this.#odata.get(`${objectName}(${id})`).query({ $select: fields.join(',') });
    const filteredResponse = Object.fromEntries(
      Object.entries(response)
        .filter(([k]) => !k.startsWith('@odata'))
        .map(([k, v]) =>
          publisherPrefix && k.startsWith(`${publisherPrefix}_`) ? [k.replace(`${publisherPrefix}_`, ''), v] : [k, v]
        )
    );
    return {
      id,
      objectName,
      data: filteredResponse,
      metadata: {
        isDeleted: false,
        lastModifiedAt: new Date(response.modifiedon),
      },
    };
  }

  public override async updateObjectRecord(
    object: StandardOrCustomObject,
    id: string,
    data: ObjectRecordUpsertData
  ): Promise<void> {
    await this.maybeRefreshAccessToken();
    let objectName = plural(object.name);
    let publisherPrefix: string | undefined;
    if (object.type === 'custom') {
      publisherPrefix = await this.getPublisherPrefix();
      objectName = `${publisherPrefix}_${objectName}`;
    }
    // map fields to prefixed fields
    const mappedData = Object.fromEntries(
      Object.entries(data).map(([k, v]) => [object.type === 'custom' ? `${publisherPrefix}_${k}` : k, v])
    );
    await this.#odata.patch(`${objectName}(${id})`, mappedData).query();
  }

  public override async listProperties(object: StandardOrCustomObjectDef): Promise<Property[]> {
    await this.maybeRefreshAccessToken();
    const objectName = object.type === 'standard' ? object.name : `${await this.getPublisherPrefix()}_${object.name}`;
    const response = await this.#odata
      .get(`EntityDefinitions(LogicalName='${objectName}')/Attributes`)
      .query({ $filter: "IsLogical eq false and LogicalName ne 'owneridtype'" });
    return response.map((property: any) => ({
      id: property.LogicalName,
      label: property.DisplayName?.UserLocalizedLabel?.Label,
      type: property.AttributeType,
      rawDetails: property,
    }));
  }

  public override async listPropertiesUnified(objectName: string): Promise<PropertyUnified[]> {
    await this.maybeRefreshAccessToken();
    const publisherPrefix = await this.getPublisherPrefix();
    const response = await this.#odata.get(`EntityDefinitions(LogicalName='${objectName}')/Attributes`).query();
    return response.map((property: any) => fromAttributeToPropertyUnified(property, publisherPrefix));
  }

  public override async streamCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    switch (commonObjectType) {
      case 'account':
        return await this.streamAccounts(fieldMappingConfig, updatedAfter, heartbeat);
      case 'contact':
        return await this.streamContacts(fieldMappingConfig, updatedAfter, heartbeat);
      case 'lead':
        return await this.streamLeads(fieldMappingConfig, updatedAfter, heartbeat);
      case 'opportunity':
        return await this.streamOpportunities(fieldMappingConfig, updatedAfter, heartbeat);
      case 'user':
        return await this.streamUsers(fieldMappingConfig, updatedAfter, heartbeat);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async listCommonObjectRecords<T extends 'account' | 'contact' | 'lead' | 'opportunity' | 'user'>(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    params: CRMCommonObjectTypeMap<T>['listParams']
  ): Promise<PaginatedSupaglueRecords<CRMCommonObjectTypeMap<T>['object']>> {
    switch (commonObjectType) {
      case 'contact':
        return await this.listContacts(fieldMappingConfig, params);
      case 'lead':
        return await this.listLeads(fieldMappingConfig, params);
      case 'opportunity':
        return await this.listOpportunities(fieldMappingConfig, params);
      case 'account':
        return await this.listAccounts(fieldMappingConfig, params);
      case 'user':
        return await this.listUsers(fieldMappingConfig, params);
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
        return await this.getAccount(id, fieldMappingConfig);
      case 'contact':
        return await this.getContact(id, fieldMappingConfig);
      case 'lead':
        return await this.getLead(id, fieldMappingConfig);
      case 'opportunity':
        return await this.getOpportunity(id, fieldMappingConfig);
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
    // need our own odata client here as we need to set the `Prefer` header to get the created object id back
    const odata = o(this.baseUrl, {
      headers: { ...this.#headers, Prefer: `return=representation` },
      referrer: undefined,
    });
    switch (commonObjectType) {
      case 'account': {
        const response = await odata
          .post('accounts', toDynamicsAccountCreateParams(params))
          .query({ $select: 'accountid' });
        return response['accountid'];
      }
      case 'contact': {
        const response = await odata
          .post('contacts', toDynamicsContactCreateParams(params))
          .query({ $select: 'contactid' });
        return response['contactid'];
      }
      case 'lead': {
        const response = await odata.post('leads', toDynamicsLeadCreateParams(params)).query({ $select: 'leadid' });
        return response['leadid'];
      }
      case 'opportunity': {
        const response = await odata
          .post('opportunities', toDynamicsOpportunityCreateParams(params))
          .query({ $select: 'opportunityid' });
        return response['opportunityid'];
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

  public override async getUserIdAndDetails(): Promise<RemoteUserIdAndDetails> {
    await this.maybeRefreshAccessToken();
    const { accessToken } = this.#credentials;
    const jwtTokenParts = accessToken.split('.');
    const jwtTokenPayload = JSON.parse(Buffer.from(jwtTokenParts[1], 'base64').toString('utf-8'));
    const activeDirectoryUserId = jwtTokenPayload.oid;
    const systemUserId = await this.getUserIdForActiveDirectoryUserId(activeDirectoryUserId);
    return {
      userId: systemUserId,
    };
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
    fieldsToFetch: FieldsToFetch,
    updatedAfter?: Date,
    expand?: string,
    heartbeat?: () => void,
    limit?: number
  ): (nextUrl?: string) => Promise<any> {
    return async (nextUrl?: string) => {
      await this.maybeRefreshAccessToken();
      try {
        // NOTE: we don't use the odata client here as it doesn't handle pagination
        const response = await fetch(
          nextUrl ||
            this.getUrlForEntityAndParams(entity, {
              $filter: updatedAfter ? `modifiedon gt ${updatedAfter?.toISOString()}` : undefined,
              $expand: expand,
              $select: fieldsToFetch?.type === 'defined' ? fieldsToFetch.fields.join(',') : undefined,
            }),
          { headers: { ...this.#headers, Prefer: `odata.maxpagesize=${limit ?? MAX_PAGE_SIZE},return=representation` } }
        );
        if (heartbeat) {
          heartbeat();
        }
        if (!response.ok) {
          throw await this.handleErr(response);
        }
        return await response.json();
      } catch (e) {
        throw await this.handleErr(e);
      }
    };
  }

  private getFieldsToFetchFromFieldMappingConfig(fieldMappingConfig: FieldMappingConfig): FieldsToFetch {
    if (fieldMappingConfig.type === 'defined') {
      const fields = Array.from(
        new Set([
          ...fieldMappingConfig.coreFieldMappings.map((v) => v.schemaField),
          ...fieldMappingConfig.additionalFieldMappings.map((v) => v.schemaField),
        ])
      );

      return {
        type: 'defined',
        fields,
      };
    }

    return {
      type: 'inherit_all_fields',
    };
  }

  private async listImpl<T extends CRMCommonObjectType>(
    objectType: T,
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams,
    mapper: (result: any) => CRMCommonObjectTypeMap<T>['object']
  ): Promise<PaginatedSupaglueRecords<CRMCommonObjectTypeMap<T>['object']>> {
    const msObjectType = objectType === 'user' ? 'systemusers' : plural(objectType);
    const fieldsToFetch = this.getFieldsToFetchFromFieldMappingConfig(fieldMappingConfig);
    const fetcher = this.getListFetcherForEntity(
      msObjectType,
      fieldsToFetch,
      params.modifiedAfter,
      objectType === 'opportunity'
        ? 'stageid_processstage($select=stagename),opportunity_leadtoopportunitysalesprocess($select=name)'
        : undefined,
      /* heartbeat */ undefined,
      params.pageSize ?? DEFAULT_PAGE_SIZE
    );
    const nextLink = decodeCursor(params.cursor)?.id as string | undefined;
    const response = await fetcher(nextLink);
    const records = response.value.map(mapper);
    return {
      records,
      pagination: {
        next: response['@odata.nextLink']
          ? encodeCursor({ id: response['@odata.nextLink'] as string, reverse: false })
          : null,
        previous: null,
      },
    };
  }

  private async listAccounts(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<Account>> {
    return this.listImpl('account', fieldMappingConfig, params, (result) =>
      fromDynamicsAccountToRemoteAccount(result, fieldMappingConfig)
    );
  }

  private async listContacts(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<Contact>> {
    return this.listImpl('contact', fieldMappingConfig, params, (result) =>
      fromDynamicsContactToRemoteContact(result, fieldMappingConfig)
    );
  }

  private async listLeads(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<Lead>> {
    return this.listImpl('lead', fieldMappingConfig, params, (result) =>
      fromDynamicsLeadToRemoteLead(result, fieldMappingConfig)
    );
  }

  private async listOpportunities(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<Opportunity>> {
    return this.listImpl('opportunity', fieldMappingConfig, params, (result) =>
      fromDynamicsOpportunityToRemoteOpportunity(result, fieldMappingConfig)
    );
  }

  private async listUsers(
    fieldMappingConfig: FieldMappingConfig,
    params: CrmListParams
  ): Promise<PaginatedSupaglueRecords<User>> {
    return this.listImpl('user', fieldMappingConfig, params, (result) =>
      fromDynamicsUserToRemoteUser(result, fieldMappingConfig)
    );
  }

  private async streamAccounts(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const fieldsToFetch = this.getFieldsToFetchFromFieldMappingConfig(fieldMappingConfig);

    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('accounts', fieldsToFetch, updatedAfter, undefined, heartbeat),
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

  private async streamContacts(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const fieldsToFetch = this.getFieldsToFetchFromFieldMappingConfig(fieldMappingConfig);

    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('contacts', fieldsToFetch, updatedAfter, undefined, heartbeat),
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

  private async streamOpportunities(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const fieldsToFetch = this.getFieldsToFetchFromFieldMappingConfig(fieldMappingConfig);

    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity(
          'opportunities',
          fieldsToFetch,
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

  private async streamLeads(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const fieldsToFetch = this.getFieldsToFetchFromFieldMappingConfig(fieldMappingConfig);
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('leads', fieldsToFetch, updatedAfter, undefined, heartbeat),
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

  private async streamUsers(
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const fieldsToFetch = this.getFieldsToFetchFromFieldMappingConfig(fieldMappingConfig);
    return paginator([
      {
        pageFetcher: this.getListFetcherForEntity('systemusers', fieldsToFetch, updatedAfter, undefined, heartbeat),
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

  public override async handleErr(err: unknown): Promise<unknown> {
    if (err instanceof Response) {
      let cause: Error | undefined;
      try {
        ({ cause } = await err.json());
      } catch (e) {
        // noop
      }

      switch (err.status) {
        case 400:
          return new InternalServerError(err.statusText, cause);
        case 401:
          return new UnauthorizedError(err.statusText, cause);
        case 403:
          return new ForbiddenError(err.statusText, cause);
        case 404:
          return new NotFoundError(err.statusText, cause);
        case 304:
          return new NotModifiedError(err.statusText, cause);
        // The following are unmapped to Supaglue errors, but we want to pass
        // them back as 4xx so they aren't 500 and developers can view error messages
        // NOTE: `429` is omitted below since we process it differently for syncs
        case 402:
        case 405:
        case 406:
        case 407:
        case 408:
        case 409:
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
          return new RemoteProviderError(err.statusText, cause);
        default:
          return new InternalServerError(err.statusText, cause);
      }
    }

    if (isErrnoException(err) && err.cause) {
      switch ((err.cause as any).code) {
        case 'ENOTFOUND':
          return new SGConnectionNoLongerAuthenticatedError((err.cause as any).message as string, err.cause as Error);
        case 'ECONNREFUSED':
          return new BadGatewayError(`Could not connect to remote CRM`, err.cause as Error);
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
