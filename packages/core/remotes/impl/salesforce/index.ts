// fetch methods / types not present in @types/node yet
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import type {
  ConnectionUnsafe,
  CRMProvider,
  ListedObjectRecord,
  ObjectRecordUpsertData,
  ObjectRecordWithMetadata,
  PaginationParams,
  Property,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
  StandardOrCustomObjectDef,
} from '@supaglue/types';
import type {
  ListObjectAssociationsParams,
  ObjectAssociation,
  ObjectAssociationCreateParams,
} from '@supaglue/types/association';
import type { AssociationTypeCardinality, SimpleAssociationType } from '@supaglue/types/association_type';
import type {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  AccountUpsertParams,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  ContactUpsertParams,
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  Lead,
  LeadCreateParams,
  LeadUpdateParams,
  LeadUpsertParams,
  ListCRMCommonObject,
  ListCRMCommonObjectTypeMap,
  ListMetadata,
  Opportunity,
  OpportunityCreateParams,
  OpportunityUpdateParams,
  User,
} from '@supaglue/types/crm';
import type {
  CustomObject,
  CustomObjectCreateParams,
  CustomObjectUpdateParams,
  SimpleCustomObject,
} from '@supaglue/types/custom_object';
import type { FieldsToFetch } from '@supaglue/types/fields_to_fetch';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { StandardOrCustomObject } from '@supaglue/types/standard_or_custom_object';
import { SALESFORCE_OBJECTS } from '@supaglue/utils';
import retry from 'async-retry';
import { parse } from 'csv-parse';
import * as jsforce from 'jsforce';
import { pipeline, Readable, Transform } from 'stream';
import {
  BadGatewayError,
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  NotModifiedError,
  RemoteProviderError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../errors';
import type { Cursor, PaginatedSupaglueRecords } from '../../../lib';
import { ASYNC_RETRY_OPTIONS, decodeCursor, encodeCursor, intersection, logger, union } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';
import { paginator } from '../../utils/paginator';
import { toMappedProperties } from '../../utils/properties';
import {
  fromSalesforceAccountToAccount,
  fromSalesforceContactToContact,
  fromSalesforceLeadToLead,
  fromSalesforceOpportunityToOpportunity,
  fromSalesforceUserToUser,
  getMapperForCommonObjectType,
  toCustomObject,
  toSalesforceAccountCreateParams,
  toSalesforceAccountUpdateParams,
  toSalesforceContactCreateParams,
  toSalesforceContactUpdateParams,
  toSalesforceLeadCreateParams,
  toSalesforceLeadUpdateParams,
  toSalesforceOpportunityCreateParams,
  toSalesforceOpportunityUpdateParams,
} from './mappers';

const SALESFORCE_API_VERSION = '57.0';

const FETCH_TIMEOUT = 60 * 1000;

const COMPOUND_TYPES = ['location', 'address'];

const propertiesForCommonObject: Record<CRMCommonObjectType, string[]> = {
  account: [
    'Id',
    'OwnerId',
    'Name',
    'Description',
    'Industry',
    'Website',
    'NumberOfEmployees',
    // We may not need all of these fields in order to map to common object
    'BillingCity',
    'BillingCountry',
    'BillingPostalCode',
    'BillingState',
    'BillingStreet',
    // We may not need all of these fields in order to map to common object
    'ShippingCity',
    'ShippingCountry',
    'ShippingPostalCode',
    'ShippingState',
    'ShippingStreet',
    'Phone',
    'Fax',
    'LastActivityDate',
    'CreatedDate',
    'SystemModstamp',
    'IsDeleted',
  ],
  contact: [
    'Id',
    'OwnerId',
    'AccountId',
    'FirstName',
    'LastName',
    'Email',
    'Phone',
    'Fax',
    'MobilePhone',
    'LastActivityDate',
    // We may not need all of these fields in order to map to common object
    'MailingCity',
    'MailingCountry',
    'MailingPostalCode',
    'MailingState',
    'MailingStreet',
    // We may not need all of these fields in order to map to common object
    'OtherCity',
    'OtherCountry',
    'OtherPostalCode',
    'OtherState',
    'OtherStreet',
    'IsDeleted',
    'CreatedDate',
    'SystemModstamp',
  ],
  opportunity: [
    'Id',
    'OwnerId',
    'Name',
    'Description',
    'LastActivityDate',
    'Amount',
    'IsClosed',
    'IsDeleted',
    'IsWon',
    'StageName',
    'CloseDate',
    'CreatedDate',
    'SystemModstamp',
    'AccountId',
  ],
  lead: [
    'Id',
    'OwnerId',
    'Title',
    'FirstName',
    'LastName',
    'ConvertedDate',
    'CreatedDate',
    'SystemModstamp',
    'ConvertedContactId',
    'ConvertedAccountId',
    'Company',
    'City',
    'State',
    'Street',
    'Country',
    'PostalCode',
    'Phone',
    'Email',
    'IsDeleted',
  ],
  user: ['Id', 'Name', 'Email', 'IsActive', 'CreatedDate', 'SystemModstamp'],
};

// this is incomplete; it only includes the fields that we need to use
type SalesforceBulk2QueryJob = {
  id: string;
  state: 'Open' | 'UploadComplete' | 'InProgress' | 'Aborted' | 'JobComplete' | 'Failed';
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getBulk2QueryJobNextLocatorFromResponse(response: Response): string | undefined {
  const locator = response.headers.get('Sforce-locator');
  return locator && locator !== 'null' ? locator : undefined;
}

function getBulk2QueryJobResultsFromResponse(response: Response): Readable {
  if (!response.body) {
    throw new Error('No response body found for salesforce bulk 2.0 query');
  }

  const parser = parse({
    columns: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-explicit-any
  return pipeline(Readable.fromWeb(response.body as any), parser, () => {});
}

class SalesforceClient extends AbstractCrmRemoteClient {
  readonly #client: jsforce.Connection;

  readonly #instanceUrl: string;
  readonly #refreshToken: string;
  #accessToken: string;

  public constructor({
    instanceUrl,
    refreshToken,
    accessToken,
    clientId,
    clientSecret,
    loginUrl,
  }: {
    instanceUrl: string;
    refreshToken: string;
    accessToken: string;
    clientId: string;
    clientSecret: string;
    loginUrl?: string;
  }) {
    super(instanceUrl);

    this.#instanceUrl = instanceUrl;
    this.#refreshToken = refreshToken;
    this.#accessToken = accessToken;

    this.#client = new jsforce.Connection({
      oauth2: new jsforce.OAuth2({
        loginUrl: loginUrl ?? 'https://login.salesforce.com',
        clientId,
        clientSecret,
      }),
      instanceUrl,
      refreshToken,
      maxRequest: 10,
      version: SALESFORCE_API_VERSION,
    });
    this.#client.on('refresh', async (accessToken: string) => {
      this.#accessToken = accessToken;
      this.emit('token_refreshed', {
        accessToken,
        expiresAt: null,
      });
    });
  }

  async #listObjectsHelper(
    object: string,
    propertiesToFetch: string[],
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const soql = `SELECT ${propertiesToFetch.join(',')}
FROM ${object}
${modifiedAfter ? `WHERE SystemModstamp > ${modifiedAfter.toISOString()} ORDER BY SystemModstamp ASC` : ''}`;

    return pipeline(
      await this.#getBulk2QueryJobResults(soql, heartbeat),
      new Transform({
        objectMode: true,
        transform: (chunk, encoding, callback) => {
          try {
            callback(null, {
              record: chunk,
              emittedAt: new Date(), // TODO: should we generate this timestamp earlier?
            });
          } catch (e: any) {
            return callback(e);
          }
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  }

  async getStandardPropertyIdsToFetch(object: string, fieldsToFetch: FieldsToFetch): Promise<string[]> {
    const sobject = capitalizeString(object);
    const allProperties = await this.getSObjectProperties(sobject);
    const allPropertyIds = allProperties.map(({ id }) => id);
    if (fieldsToFetch.type === 'inherit_all_fields') {
      return allPropertyIds;
    }
    return intersection(allPropertyIds, union(['Id', 'IsDeleted', 'SystemModstamp'], fieldsToFetch.fields));
  }

  public override async listStandardObjects(): Promise<string[]> {
    return SALESFORCE_OBJECTS as unknown as string[];
  }

  public override async listCustomObjects(): Promise<SimpleCustomObject[]> {
    const metadata = await this.#client.describeGlobal();
    // this returns standard objects and external objects too,
    // so we need to filter them out
    return metadata.sobjects
      .filter(({ custom }) => custom)
      .map(({ name }) => ({
        id: name,
        name: name,
      }));
  }

  public override async listStandardObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const propertiesToFetch = await this.getStandardPropertyIdsToFetch(object, fieldsToFetch);
    const stream = await this.#listObjectsHelper(object, propertiesToFetch, modifiedAfter, heartbeat);

    return pipeline(
      stream,
      new Transform({
        objectMode: true,
        transform: (chunk, encoding, callback) => {
          // TODO: types
          const { record, emittedAt } = chunk;
          // not declaring this in-line so we have the opportunity to do type checking
          const emittedRecord: ListedObjectRecord = {
            id: record.Id,
            rawData: record,
            rawProperties: record,
            isDeleted: record.IsDeleted === 'true',
            lastModifiedAt: new Date(record.SystemModstamp),
            emittedAt: emittedAt,
          };
          try {
            // TODO: types
            callback(null, emittedRecord);
          } catch (e: any) {
            return callback(e);
          }
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
  }

  public override async listCustomObjectRecords(
    object: string,
    fieldsToFetch: FieldsToFetch,
    modifiedAfter?: Date | undefined,
    heartbeat?: (() => void) | undefined
  ): Promise<Readable> {
    return await this.listStandardObjectRecords(object, fieldsToFetch, modifiedAfter, heartbeat);
  }

  async getCommonPropertiesToFetch(
    commonObjectType: CRMCommonObjectType | ListCRMCommonObject,
    fieldMappingConfig?: FieldMappingConfig
  ): Promise<string[]> {
    const sobject = capitalizeString(commonObjectType);
    const allProperties = await this.getSObjectProperties(sobject);
    const allPropertyIds = allProperties.map(({ id }) => id);
    if (!fieldMappingConfig || fieldMappingConfig.type === 'inherit_all_fields') {
      return allPropertyIds;
    }
    return intersection(allPropertyIds, [
      ...propertiesForCommonObject[commonObjectType],
      ...fieldMappingConfig.coreFieldMappings.map((fieldMapping) => fieldMapping.mappedField),
      ...fieldMappingConfig.additionalFieldMappings.map((fieldMapping) => fieldMapping.mappedField),
    ]);
  }

  public override async listCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date | undefined,
    heartbeat?: () => void
  ): Promise<Readable> {
    const sobject = capitalizeString(commonObjectType);
    const propertiesToFetch = await this.getCommonPropertiesToFetch(commonObjectType, fieldMappingConfig);

    const stream = await this.#listObjectsHelper(sobject, propertiesToFetch, updatedAfter, heartbeat);
    const mapper = (record: Record<string, unknown>) => ({
      ...getMapperForCommonObjectType(commonObjectType)(record),
      rawData: toMappedProperties(record, fieldMappingConfig),
    });

    return pipeline(
      stream,
      new Transform({
        objectMode: true,
        transform: (chunk, encoding, callback) => {
          try {
            callback(null, {
              record: mapper(chunk.record),
              emittedAt: chunk.emittedAt,
            });
          } catch (e: any) {
            return callback(e);
          }
        },
      }),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {}
    );
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
        return this.getUser(id, fieldMappingConfig);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async createCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    switch (commonObjectType) {
      case 'account':
        return this.createAccount(params);
      case 'contact':
        return this.createContact(params);
      case 'lead':
        return this.createLead(params);
      case 'opportunity':
        return this.createOpportunity(params);
      case 'user':
        throw new Error('Cannot create users in Salesforce');
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async upsertCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['upsertParams']
  ): Promise<string> {
    switch (commonObjectType) {
      case 'account':
        return this.upsertAccount(params as AccountUpsertParams);
      case 'contact':
        return this.upsertContact(params as ContactUpsertParams);
      case 'lead':
        return this.upsertLead(params as LeadUpsertParams);
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async updateCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<string> {
    switch (commonObjectType) {
      case 'account':
        return this.updateAccount(params);
      case 'contact':
        return this.updateContact(params);
      case 'lead':
        return this.updateLead(params);
      case 'opportunity':
        return this.updateOpportunity(params);
      case 'user':
        throw new Error('Cannot update users in Salesforce');
      default:
        throw new Error(`Unsupported common object type: ${commonObjectType}`);
    }
  }

  public override async getObjectRecord(
    object: StandardOrCustomObject,
    id: string,
    fields: string[]
  ): Promise<ObjectRecordWithMetadata> {
    const record = await this.#client.retrieve(object.name, id, {
      fields,
    });
    return {
      id: record.Id as string,
      standardObjectName: object.name,
      data: record,
      metadata: {
        isDeleted: record.IsDeleted === 'true',
        lastModifiedAt: new Date(record.SystemModstamp),
      },
    };
  }

  public override async createObjectRecord(
    object: StandardOrCustomObject,
    data: ObjectRecordUpsertData
  ): Promise<string> {
    const response = await this.#client.create(object.name, data);
    if (!response.success) {
      throw new Error(`Failed to create Salesforce ${object.name}`);
    }
    return response.id;
  }

  public override async updateObjectRecord(
    object: StandardOrCustomObject,
    id: string,
    data: ObjectRecordUpsertData
  ): Promise<void> {
    const response = await this.#client.update(object.name, {
      Id: id,
      ...data,
    });
    if (!response.success) {
      throw new Error(`Failed to update Salesforce ${object.name}: ${JSON.stringify(response)}`);
    }
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#accessToken}`,
    };
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    // TODO(735): We should have a periodic workflow for refreshing tokens for all connections
    await this.#refreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }

  public override async getCustomObject(id: string): Promise<CustomObject> {
    if (!id.endsWith('__c')) {
      // Salesforce doesn't actually enforce this, and will just append __c.
      // However, we want to enforce this to avoid confusion when using
      // the custom object name in other places.
      throw new BadRequestError('Custom object id must end with __c');
    }

    const metadata = await this.#client.describe(id);
    return toCustomObject(metadata);
  }

  public override async createCustomObject(params: CustomObjectCreateParams): Promise<string> {
    if (!params.fields.length) {
      throw new BadRequestError('Cannot create custom object with no fields');
    }

    const primaryField = params.fields.find((field) => field.keyName === params.primaryFieldKeyName);

    if (!primaryField) {
      throw new BadRequestError(`Could not find primary field with key name ${params.primaryFieldKeyName}`);
    }

    if (primaryField.fieldType !== 'string') {
      throw new BadRequestError(
        `Primary field must be of type string, but was ${primaryField.fieldType} with key name ${params.primaryFieldKeyName}`
      );
    }

    if (!primaryField.isRequired) {
      throw new BadRequestError(
        `Primary field must be required, but was not with key name ${params.primaryFieldKeyName}`
      );
    }

    if (primaryField.keyName !== 'Name') {
      throw new BadRequestError(
        `Primary field for salesforce must have key name 'Name', but was ${primaryField.keyName}`
      );
    }

    const nonPrimaryFields = params.fields.filter((field) => field.keyName !== params.primaryFieldKeyName);

    if (nonPrimaryFields.some((field) => !field.keyName.endsWith('__c'))) {
      throw new BadRequestError('Custom object field key names must end with __c');
    }

    const results = await this.#client.metadata.create('CustomObject', [
      {
        deploymentStatus: 'Deployed',
        sharingModel: 'ReadWrite',
        fullName: params.name,
        label: params.labels.singular,
        pluralLabel: params.labels.plural,
        nameField: {
          label: primaryField.displayName,
          type: 'Text',
        },
        fields: nonPrimaryFields.map((field) => {
          const base = {
            fullName: field.keyName,
            label: field.displayName,
            type: field.fieldType === 'string' ? 'Text' : 'Number',
            required: field.isRequired,
          };

          if (field.fieldType === 'string') {
            return {
              ...base,
              // TODO: support configurations per field type
              length: 255,
            };
          }

          return {
            ...base,
            // TODO: support configurations per field type
            precision: field.fieldType === 'number' ? 18 : undefined,
            scale: field.fieldType === 'number' ? 0 : undefined,
          };
        }),
      },
    ]);

    if (results.some((result) => !result.success)) {
      throw new Error(
        `Failed to create custom object. Since creating a custom object with custom fields is not an atomic operation in Salesforce, you should use the custom object name ${
          params.name
        } as the 'id' parameter in the Custom Object GET endpoint to check if it was already partially created. If so, use the PUT endpoint to update the existing object. Raw error message from Salesforce: ${JSON.stringify(
          results,
          null,
          2
        )}`
      );
    }

    // TODO: is this accurate?
    return params.name;
  }

  public override async updateCustomObject(params: CustomObjectUpdateParams): Promise<void> {
    // Validate stuff

    if (!params.name.endsWith('__c')) {
      // Salesforce doesn't actually enforce this, and will just append __c.
      // However, we want to enforce this to avoid confusion when using
      // the custom object name in other places.
      throw new BadRequestError('Custom object name must end with __c');
    }

    if (!params.fields.length) {
      throw new BadRequestError('Cannot create custom object with no fields');
    }

    const primaryField = params.fields.find((field) => field.keyName === params.primaryFieldKeyName);

    if (!primaryField) {
      throw new BadRequestError(`Could not find primary field with key name ${params.primaryFieldKeyName}`);
    }

    if (primaryField.fieldType !== 'string') {
      throw new BadRequestError(
        `Primary field must be of type string, but was ${primaryField.fieldType} with key name ${params.primaryFieldKeyName}`
      );
    }

    if (!primaryField.isRequired) {
      throw new BadRequestError(
        `Primary field must be required, but was not with key name ${params.primaryFieldKeyName}`
      );
    }

    if (primaryField.keyName !== 'Name') {
      throw new BadRequestError(
        `Primary field for salesforce must have key name 'Name', but was ${primaryField.keyName}`
      );
    }

    const nonPrimaryFields = params.fields.filter((field) => field.keyName !== params.primaryFieldKeyName);

    if (nonPrimaryFields.some((field) => !field.keyName.endsWith('__c'))) {
      throw new BadRequestError('Custom object field key names must end with __c');
    }

    // Check against existing object
    const existingObject = await this.getCustomObject(params.name);
    const existingObjectNonPrimaryAndLookupFields = existingObject.fields.filter(
      (field) => field.keyName !== existingObject.primaryFieldKeyName
    );

    // Calculate which fields got added, updated, or deleted
    const addedFields = nonPrimaryFields.filter(
      (field) =>
        !existingObjectNonPrimaryAndLookupFields.some((existingField) => existingField.keyName === field.keyName)
    );
    const updatedFields = nonPrimaryFields.filter((field) =>
      existingObjectNonPrimaryAndLookupFields.some(
        (existingField) =>
          existingField.keyName === field.keyName &&
          (existingField.displayName !== field.displayName ||
            existingField.fieldType !== field.fieldType ||
            existingField.isRequired !== field.isRequired)
      )
    );
    const deletedFields = existingObjectNonPrimaryAndLookupFields.filter(
      (existingField) => !nonPrimaryFields.some((field) => field.keyName === existingField.keyName)
    );

    // Update object and existing fields
    const updateObjectResults = await this.#client.metadata.update('CustomObject', [
      {
        deploymentStatus: 'Deployed',
        sharingModel: 'ReadWrite',
        fullName: params.name,
        label: params.labels.singular,
        pluralLabel: params.labels.plural,
        nameField: {
          label: primaryField.displayName,
          type: 'Text',
        },
        fields: updatedFields.map((field) => {
          const base = {
            fullName: field.keyName,
            label: field.displayName,
            type: field.fieldType === 'string' ? 'Text' : 'Number',
            required: field.isRequired,
          };

          if (field.fieldType === 'string') {
            return {
              ...base,
              // TODO: support configurations per field type
              length: 255,
            };
          } else {
            return {
              ...base,
              // TODO: support configurations per field type
              precision: field.fieldType === 'number' ? 18 : undefined,
              scale: field.fieldType === 'number' ? 0 : undefined,
            };
          }
        }),
      },
    ]);
    if (updateObjectResults.some((result) => !result.success)) {
      throw new Error(`Failed to update custom object: ${JSON.stringify(updateObjectResults, null, 2)}`);
    }

    // Add new fields
    if (addedFields.length) {
      const addCustomFieldsResults = await this.#client.metadata.create(
        'CustomField',
        addedFields.map((field) => {
          const base = {
            fullName: `${params.name}.${field.keyName}`,
            label: field.displayName,
            type: field.fieldType === 'string' ? 'Text' : 'Number',
            required: field.isRequired,
          };

          if (field.fieldType === 'string') {
            return {
              ...base,
              // TODO: support configurations per field type
              length: 255,
            };
          } else {
            return {
              ...base,
              // TODO: support configurations per field type
              precision: field.fieldType === 'number' ? 18 : undefined,
              scale: field.fieldType === 'number' ? 0 : undefined,
            };
          }
        })
      );

      if (addCustomFieldsResults.some((result) => !result.success)) {
        throw new Error(`Failed to add custom fields: ${JSON.stringify(addCustomFieldsResults, null, 2)}`);
      }
    }

    // After custom fields are created, they're not automatically visible. We need to
    // set the field-level security to Visible for profiles.
    // Instead of updating all profiles, we'll just update it for the profile for the user
    // in this connection.
    //
    // We're doing this all the time, even if there were no detected added fields, since
    // the previous call to this endpoint could have failed after creating fields but before
    // adding permissions, and we want the second call to this endpoint to fix that.
    //
    // TODO: do we want to make it visible for all profiles?
    const { userInfo } = this.#client;
    if (!userInfo) {
      throw new Error('Could not get info of current user');
    }

    // Get the user record
    const user = await this.#client.retrieve('User', userInfo.id, {
      fields: ['ProfileId'],
    });

    // Get the first permission set
    // TODO: Is this the right thing to do? How do we know the first one is the best one?
    const result = await this.#client.query(`SELECT Id FROM PermissionSet WHERE ProfileId='${user.ProfileId}' LIMIT 1`);
    if (!result.records.length) {
      throw new Error(`Could not find permission set for profile ${user.ProfileId}`);
    }

    const permissionSetId = result.records[0].Id;

    // Figure out which fields already have permissions
    // TODO: Paginate
    const { records: existingFieldPermissions } = await this.#client.query(
      `SELECT Field FROM FieldPermissions WHERE SobjectType='${params.name}' AND ParentId='${permissionSetId}'`
    );
    const existingFieldPermissionFieldNames = existingFieldPermissions.map((fieldPermission) => fieldPermission.Field);
    const fieldsToAddPermissionsFor = nonPrimaryFields.filter(
      (field) => !existingFieldPermissionFieldNames.includes(`${params.name}.${field.keyName}`)
    );

    const { compositeResponse } = await this.#client.requestPost<{ compositeResponse: { httpStatusCode: number }[] }>(
      `/services/data/v${SALESFORCE_API_VERSION}/composite`,
      {
        // We're doing this for all fields, not just the added ones, in case the previous
        // call to this endpoint succeeded creating additional fields but failed to
        // add permissions for them.
        compositeRequest: fieldsToAddPermissionsFor.map((field) => ({
          referenceId: field.keyName,
          method: 'POST',
          url: `/services/data/v${SALESFORCE_API_VERSION}/sobjects/FieldPermissions/`,
          body: {
            ParentId: permissionSetId,
            SobjectType: params.name,
            Field: `${params.name}.${field.keyName}`,
            PermissionsEdit: true,
            PermissionsRead: true,
          },
        })),
      }
    );
    // if not 2xx
    if (compositeResponse.some((response) => response.httpStatusCode < 200 || response.httpStatusCode >= 300)) {
      throw new Error(`Failed to add field permissions: ${JSON.stringify(compositeResponse, null, 2)}`);
    }

    // Delete fields
    if (deletedFields.length) {
      const deleteFieldResults = await this.#client.metadata.delete(
        'CustomField',
        deletedFields.map((field) => `${params.name}.${field.keyName}`)
      );
      if (deleteFieldResults.some((result) => !result.success)) {
        throw new Error(`Failed to delete custom fields: ${JSON.stringify(deleteFieldResults, null, 2)}`);
      }
    }
  }

  public async listAssociationTypes(
    sourceObject: StandardOrCustomObject,
    targetObject: StandardOrCustomObject
  ): Promise<SimpleAssociationType[]> {
    const metadata = await this.#client.describe(sourceObject.name);

    const associationTypeFields = metadata.fields.filter(
      (field) => field.type === 'reference' && field.referenceTo && field.referenceTo.includes(targetObject.name)
    );

    return associationTypeFields.map((field) => ({
      id: `${sourceObject.name}.${field.name}`,
      sourceObject,
      targetObject,
      displayName: field.label ?? '',
      cardinality: 'UNKNOWN',
    }));
  }

  public override async createAssociationType(
    sourceObject: StandardOrCustomObject,
    targetObject: StandardOrCustomObject,
    keyName: string,
    displayName: string,
    cardinality: AssociationTypeCardinality
  ): Promise<void> {
    // TODO: support other types of objects as source
    if (sourceObject.type !== 'custom') {
      throw new BadRequestError(`Only custom objects are supported as source objects for Salesforce`);
    }

    if (cardinality !== 'ONE_TO_MANY') {
      throw new BadRequestError('Only ONE_TO_MANY cardinality is supported in Salesforce');
    }

    // if keyName doesn't end with __c, we need to add it ourselves
    if (!keyName.endsWith('__c')) {
      keyName = `${keyName}__c`;
    }

    // Look up source custom object to figure out a relationship name
    // TODO: we should find a better way to do this
    const sourceCustomObjectMetadata = await this.#client.metadata.read('CustomObject', sourceObject.name);

    // If the relationship field doesn't already exist, create it
    const existingField = sourceCustomObjectMetadata.fields?.find((field) => field.fullName === keyName);

    const customFieldPayload = {
      fullName: `${sourceObject.name}.${keyName}`,
      label: displayName,
      // The custom field name you provided Related Opportunity on object Opportunity can
      // only contain alphanumeric characters, must begin with a letter, cannot end
      // with an underscore or contain two consecutive underscore characters, and
      // must be unique across all Opportunity fields
      // TODO: allow developer to specify name?
      relationshipName: sourceCustomObjectMetadata.pluralLabel?.replace(/\s/g, '') ?? 'relationshipName',
      type: 'Lookup',
      required: false,
      referenceTo: targetObject.name,
    };

    if (existingField) {
      const result = await this.#client.metadata.update('CustomField', customFieldPayload);

      if (!result.success) {
        throw new Error(
          `Failed to update custom field for association type: ${JSON.stringify(result.errors, null, 2)}`
        );
      }
    } else {
      const result = await this.#client.metadata.create('CustomField', customFieldPayload);

      if (!result.success) {
        throw new Error(
          `Failed to create custom field for association type: ${JSON.stringify(result.errors, null, 2)}`
        );
      }
    }

    const { userInfo } = this.#client;
    if (!userInfo) {
      throw new Error('Could not get info of current user');
    }

    // Get the user record
    const user = await this.#client.retrieve('User', userInfo.id, {
      fields: ['ProfileId'],
    });

    // Get the first permission set
    // TODO: Is this the right thing to do? How do we know the first one is the best one?
    const result = await this.#client.query(`SELECT Id FROM PermissionSet WHERE ProfileId='${user.ProfileId}' LIMIT 1`);
    if (!result.records.length) {
      throw new Error(`Could not find permission set for profile ${user.ProfileId}`);
    }

    const permissionSetId = result.records[0].Id;

    // Figure out which fields already have permissions
    const { records: existingFieldPermissions } = await this.#client.query(
      `SELECT Id,Field FROM FieldPermissions WHERE SobjectType='${sourceObject.name}' AND ParentId='${permissionSetId}' AND Field='${sourceObject.name}.${keyName}'`
    );
    if (existingFieldPermissions.length) {
      // Update permission
      const existingFieldPermission = existingFieldPermissions[0];
      const result = await this.#client.update('FieldPermissions', {
        Id: existingFieldPermission.Id as string,
        ParentId: permissionSetId,
        SobjectType: sourceObject.name,
        Field: `${sourceObject.name}.${keyName}`,
        PermissionsEdit: true,
        PermissionsRead: true,
      });
      if (!result.success) {
        throw new Error(
          `Failed to update field permission for association type: ${JSON.stringify(result.errors, null, 2)}`
        );
      }
    } else {
      // Create permission
      const result = await this.#client.create('FieldPermissions', {
        ParentId: permissionSetId,
        SobjectType: sourceObject.name,
        Field: `${sourceObject.name}.${keyName}`,
        PermissionsEdit: true,
        PermissionsRead: true,
      });
      if (!result.success) {
        throw new Error(
          `Failed to create field permission for association type: ${JSON.stringify(result.errors, null, 2)}`
        );
      }
    }
  }

  public override async listAssociations(params: ListObjectAssociationsParams): Promise<ObjectAssociation[]> {
    // Use the metadata API to find out if there are fields that are lookups to the target object
    const sourceObjectIdOrName =
      params.sourceRecord.object.type === 'custom' ? params.sourceRecord.object.id : params.sourceRecord.object.name;
    const targetObjectIdOrName =
      params.targetObject.type === 'custom' ? params.targetObject.id : params.targetObject.name;

    const metadata = await this.#client.describe(sourceObjectIdOrName);

    const associationTypeFields = metadata.fields.filter(
      (field) => field.type === 'reference' && field.referenceTo && field.referenceTo.includes(targetObjectIdOrName)
    );

    const record = await this.#client.retrieve(sourceObjectIdOrName, params.sourceRecord.id);

    // Iterate over fields and find the ones that refer to the target object
    return associationTypeFields.flatMap((field) => {
      if (!field.name) {
        throw new Error(`Unexpectedly could not find name for field ${field}`);
      }
      const targetRecordId = record[field.name];
      if (!targetRecordId) {
        return [];
      }
      return {
        associationTypeId: `${sourceObjectIdOrName}.${field.name}`,
        sourceRecord: params.sourceRecord,
        targetRecord: {
          id: targetRecordId,
          object: params.targetObject,
        },
      };
    });
  }

  public override async createAssociation(params: ObjectAssociationCreateParams): Promise<ObjectAssociation> {
    // keyName looks like `MyCustomObject__c.MyLookupField__c`. We should validate and then pull out the second part after the '.'
    const keyNameParts = params.associationTypeId.split('.');
    if (keyNameParts.length !== 2) {
      throw new BadRequestError(`Invalid association type id ${params.associationTypeId}`);
    }
    const keyName = keyNameParts[1];

    const sourceObjectIdOrName =
      params.sourceRecord.object.type === 'custom' ? params.sourceRecord.object.id : params.sourceRecord.object.name;

    const result = await this.#client.update(sourceObjectIdOrName, {
      Id: params.sourceRecord.id,
      [keyName]: params.targetRecord.id,
    });
    if (!result.success) {
      throw new Error(`Failed to create Salesforce association: ${JSON.stringify(result.errors, null, 2)}`);
    }

    return params;
  }

  async #refreshAccessToken(): Promise<void> {
    // TODO: Shouldn't be relying on `jsforce` to do this.
    const token = await this.#client.oauth2.refreshToken(this.#refreshToken);
    this.#accessToken = token.access_token;
    this.emit('token_refreshed', {
      accessToken: token.access_token,
      expiresAt: null,
    });
  }

  async #fetchImpl(path: string, init: RequestInit, timeout = FETCH_TIMEOUT) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(`${this.#instanceUrl}${path}`, {
      ...init,
      headers: {
        ...init.headers,
        ...this.getAuthHeadersForPassthroughRequest(),
      },
      signal: controller.signal,
    });
    clearTimeout(id);

    return response;
  }

  async #fetch(path: string, init: RequestInit): Promise<ReturnType<typeof fetch>> {
    const helper = async (bail: (e: Error) => void) => {
      let response = await this.#fetchImpl(path, init);

      // Only try to refresh token once (to avoid infinite loop).
      // TODO: Clean up this code a bit.
      // TODO: We should consider having a global singleton to do a single token refresh rather
      //       than many concurrent ones.
      // TODO: Check on `jsforce` periodically to see if we can just use that library instead
      // of writing this ourselves. For now, we are writing ourselves due to issue with hanging
      // CSV download for bulk 2.0 with large loads and also more future control of rate limits,
      // etc.
      if (response.status === 401) {
        try {
          await this.#refreshAccessToken();
        } catch (e: any) {
          logger.error(e);
          // The error name in jsforce is generated at https://github.com/jsforce/jsforce/blob/master/lib/oauth2.js#L197
          // TODO(624): Move off of jsforce
          if (e.name === 'ERROR_HTTP_429') {
            throw e;
          }
          bail(e);
          return null as unknown as ReturnType<typeof fetch>;
        }
        response = await this.#fetchImpl(path, init);
      }

      if (response.status === 200) {
        return response;
      }
      if (response.status === 429) {
        logger.warn(
          {
            status: response.status,
            statusText: response.statusText,
            text: await response.text(),
            body: response.body,
          },
          `Encountered Salesforce rate limiting.`
        );
        throw new TooManyRequestsError(`Encountered Salesforce rate limiting.`);
      }

      const error = new Error(
        `Status code ${response.status} and status ${
          response.statusText
        } when calling salesforce API. Error: ${await response.text()}. Body: ${response.body}`
      );
      logger.error(error);
      bail(error);
      return null as unknown as ReturnType<typeof fetch>;
    };
    return await retry(helper, ASYNC_RETRY_OPTIONS);
  }

  async #submitBulk2QueryJob(soql: string): Promise<SalesforceBulk2QueryJob> {
    const response = await this.#fetch(`/services/data/v${SALESFORCE_API_VERSION}/jobs/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'queryAll',
        query: soql,
      }),
    });
    return await response.json();
  }

  async #pollBulk2QueryJob(jobId: string, heartbeat?: () => void): Promise<void> {
    const poll = async (): Promise<SalesforceBulk2QueryJob> => {
      const response = await this.#fetch(`/services/data/v${SALESFORCE_API_VERSION}/jobs/query/${jobId}`, {
        method: 'GET',
      });
      return await response.json();
    };

    const startTime = Date.now();
    const timeout = 2 * 60 * 60 * 1000; // TODO: make configurable
    const interval = 10000; // TODO: make configurable

    while (startTime + timeout > Date.now()) {
      const pollResponse = await poll();
      if (heartbeat) {
        heartbeat();
      }
      const { state } = pollResponse;
      switch (state) {
        case 'Open':
          throw new Error('job has not been started');
        case 'Aborted':
          throw new Error('job has been aborted');
        case 'UploadComplete':
        case 'InProgress':
          await delay(interval);
          break;
        case 'Failed':
          throw new Error('job has failed');
        case 'JobComplete':
          return;
      }
    }

    throw new Error('bulk 2.0 job polling timed out');
  }

  async #getBulk2QueryJobResponse(jobId: string, locator?: string): Promise<Response> {
    const params = new URLSearchParams();
    if (locator) {
      params.set('locator', locator);
    }

    return await this.#fetch(`/services/data/v${SALESFORCE_API_VERSION}/jobs/query/${jobId}/results?${params}`, {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        Accept: 'text/csv',
      },
    });
  }

  async #getBulk2QueryJobResults(soql: string, heartbeat?: () => void): Promise<Readable> {
    const response = await this.#submitBulk2QueryJob(soql);
    const { id } = response;

    await this.#pollBulk2QueryJob(id, heartbeat);

    return await paginator([
      {
        pageFetcher: this.#getBulk2QueryJobResponse.bind(this, id),
        createStreamFromPage: getBulk2QueryJobResultsFromResponse,
        getNextCursorFromPage: getBulk2QueryJobNextLocatorFromResponse,
      },
    ]);
  }

  public override async listProperties(object: StandardOrCustomObjectDef): Promise<Property[]> {
    return await this.getSObjectProperties(capitalizeString(object.name));
  }

  private async getSObjectProperties(sobject: string): Promise<Property[]> {
    const response = await this.#client.describe(sobject);
    return response.fields
      .filter((field: { type: string }) => !COMPOUND_TYPES.includes(field.type))
      .map((field: { name: string; type: string; label: string }) => ({
        id: field.name,
        label: field.label,
        type: field.type,
        rawDetails: field,
      }));
  }

  public async getAccount(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Account> {
    const account = await this.#client.retrieve('Account', id);
    return { ...fromSalesforceAccountToAccount(account), rawData: toMappedProperties(account, fieldMappingConfig) };
  }

  public async createAccount(params: AccountCreateParams): Promise<string> {
    const response = await this.#client.create('Account', toSalesforceAccountCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce account');
    }
    return response.id;
  }

  public async upsertAccount(params: AccountUpsertParams): Promise<string> {
    if (params.upsertOn.key !== 'website') {
      throw new BadRequestError(`Upsert key must be 'website' for Salesfoce accounts`);
    }
    const response = await this.#client.query(
      `SELECT Id FROM Account WHERE Website IN (${params.upsertOn.values.map((value) => `'${value}'`).join(', ')})`
    );
    if (response.totalSize > 1) {
      throw new BadRequestError('More than one account found for upsert query');
    }
    if (response.totalSize === 0) {
      return this.createAccount(params.record);
    }
    const existingAccountId = response.records[0].Id as string;
    return this.updateAccount({ ...params.record, id: existingAccountId });
  }

  public async updateAccount(params: AccountUpdateParams): Promise<string> {
    const response = await this.#client.update('Account', toSalesforceAccountUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce account');
    }
    return response.id;
  }

  public async getContact(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Contact> {
    const contact = await this.#client.retrieve('Contact', id);
    return { ...fromSalesforceContactToContact(contact), rawData: toMappedProperties(contact, fieldMappingConfig) };
  }

  public async createContact(params: ContactCreateParams): Promise<string> {
    const response = await this.#client.create('Contact', toSalesforceContactCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce contact');
    }
    return response.id;
  }

  public async upsertContact(params: ContactUpsertParams): Promise<string> {
    if (params.upsertOn.key !== 'email') {
      throw new BadRequestError(`Upsert key must be 'email' for Salesforce contacts`);
    }
    const response = await this.#client.query(
      `SELECT Id FROM Contact WHERE Email IN (${params.upsertOn.values.map((value) => `'${value}'`).join(', ')})`
    );
    if (response.totalSize > 1) {
      throw new BadRequestError('More than one contact found for upsert query');
    }
    if (response.totalSize === 0) {
      return this.createContact(params.record);
    }
    const existingContactId = response.records[0].Id as string;
    return this.updateContact({ ...params.record, id: existingContactId });
  }

  public async updateContact(params: ContactUpdateParams): Promise<string> {
    const response = await this.#client.update('Contact', toSalesforceContactUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce contact');
    }
    return response.id;
  }

  public async getOpportunity(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Opportunity> {
    const contact = await this.#client.retrieve('Opportunity', id);
    return {
      ...fromSalesforceOpportunityToOpportunity(contact),
      rawData: toMappedProperties(contact, fieldMappingConfig),
    };
  }

  public async createOpportunity(params: OpportunityCreateParams): Promise<string> {
    const response = await this.#client.create('Opportunity', toSalesforceOpportunityCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce opportunity');
    }
    return response.id;
  }

  public async updateOpportunity(params: OpportunityUpdateParams): Promise<string> {
    const response = await this.#client.update('Opportunity', toSalesforceOpportunityUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce opportunity');
    }
    return response.id;
  }

  public async getLead(id: string, fieldMappingConfig: FieldMappingConfig): Promise<Lead> {
    const lead = await this.#client.retrieve('Lead', id);
    return { ...fromSalesforceLeadToLead(lead), rawData: toMappedProperties(lead, fieldMappingConfig) };
  }

  public async createLead(params: LeadCreateParams): Promise<string> {
    const response = await this.#client.create('Lead', toSalesforceLeadCreateParams(params));
    if (!response.success) {
      throw new Error('Failed to create Salesforce lead');
    }
    return response.id;
  }

  public async upsertLead(params: LeadUpsertParams): Promise<string> {
    if (params.upsertOn.key !== 'email') {
      throw new BadRequestError(`Upsert key must be 'email' for Salesforce leads`);
    }
    const response = await this.#client.query(
      `SELECT Id FROM Lead WHERE Email IN (${params.upsertOn.values.map((value) => `'${value}'`).join(', ')})`
    );
    if (response.totalSize > 1) {
      throw new BadRequestError('More than one contact found for upsert query');
    }
    if (response.totalSize === 0) {
      return this.createLead(params.record);
    }
    const existingContactId = response.records[0].Id as string;
    return this.updateLead({ ...params.record, id: existingContactId });
  }

  public async updateLead(params: LeadUpdateParams): Promise<string> {
    const response = await this.#client.update('Lead', toSalesforceLeadUpdateParams(params));
    if (!response.success) {
      throw new Error('Failed to update Salesforce lead');
    }
    return response.id;
  }

  public async getUser(id: string, fieldMappingConfig: FieldMappingConfig): Promise<User> {
    const user = await this.#client.retrieve('User', id);
    return { ...fromSalesforceUserToUser(user), rawData: toMappedProperties(user, fieldMappingConfig) };
  }

  public override async listLists(
    objectType: Exclude<CRMCommonObjectType, 'user'>,
    paginationParams: PaginationParams
  ): Promise<PaginatedSupaglueRecords<ListMetadata>> {
    const mappedObjectType = capitalizeString(objectType);
    let cursor: Cursor | undefined;
    if (paginationParams.cursor) {
      cursor = decodeCursor(paginationParams.cursor);
    }

    let query = this.#client
      .sobject('ListView')
      .find({ SobjectType: mappedObjectType, Id: cursor?.id ? { $gt: cursor.id as string } : undefined })
      .orderby('Id');

    if (paginationParams.page_size) {
      query = query.limit(parseInt(paginationParams.page_size));
    }

    const [response, { totalSize: totalCount }] = await Promise.all([
      await query.execute(),
      this.#client.query(`SELECT COUNT() FROM ListView WHERE SobjectType = '${mappedObjectType}'`),
    ]);

    // Map response to ListMetadata interface
    return {
      records: response.map((record: any) => ({
        name: record.DeveloperName,
        label: record.Name,
        id: record.Id,
        objectType: objectType,
        rawData: record,
      })),
      pagination: {
        total_count: totalCount,
        next: encodeCursor({
          id: response.length ? response[response.length - 1].Id : null,
          reverse: false,
        }),
        previous: null,
      },
    };
  }

  public override async listListMembership<T extends ListCRMCommonObject>(
    objectType: T,
    listId: string,
    paginationParams: PaginationParams
  ): Promise<PaginatedSupaglueRecords<ListCRMCommonObjectTypeMap<T>> & { metadata: ListMetadata }> {
    const commonObjectType = capitalizeString(objectType);
    const propertiesToFetch = await this.getCommonPropertiesToFetch(objectType);

    const listDescription = await this.#client.sobject(commonObjectType).listview(listId).describe();
    const queryRemainder = (listDescription as any).query.split(' FROM ')[1];
    const [fromClause, orderByClause] = queryRemainder.split(' ORDER BY ');

    let cursor: Cursor | undefined;
    if (paginationParams.cursor) {
      cursor = decodeCursor(paginationParams.cursor);
    }

    const [
      response,
      { totalSize: totalCount },
      {
        records: [listMetadata],
      },
    ] = await Promise.all([
      this.#client.query(
        `SELECT ${propertiesToFetch.join(', ')} FROM ${fromClause} ${
          cursor?.id ? `WHERE Id > '${cursor.id}'` : ''
        } ORDER BY ${orderByClause} ${paginationParams.page_size ? `LIMIT ${paginationParams.page_size}` : ''}`
      ),
      this.#client.query(`SELECT COUNT() FROM ${fromClause}`),
      this.#client.query(`SELECT FIELDS(STANDARD) FROM ListView WHERE Id = '${listId}'`),
    ]);

    let commonObjectRecords: ListCRMCommonObjectTypeMap<T>[] = [];

    switch (objectType) {
      case 'contact':
        commonObjectRecords = response.records.map((record) => ({
          ...fromSalesforceContactToContact(record),
        })) as ListCRMCommonObjectTypeMap<T>[]; // TODO: figure out types
        break;
      case 'account':
        commonObjectRecords = response.records.map((record) => ({
          ...fromSalesforceAccountToAccount(record),
        })) as ListCRMCommonObjectTypeMap<T>[]; // TODO: figure out types
        break;
      case 'lead':
        commonObjectRecords = response.records.map((record) => ({
          ...fromSalesforceLeadToLead(record),
        })) as ListCRMCommonObjectTypeMap<T>[]; // TODO: figure out types
        break;
      case 'opportunity':
        commonObjectRecords = response.records.map((record) => ({
          ...fromSalesforceOpportunityToOpportunity(record),
        })) as ListCRMCommonObjectTypeMap<T>[]; // TODO: figure out types
        break;
    }

    return {
      records: commonObjectRecords,
      metadata: {
        name: listMetadata.DeveloperName,
        label: listMetadata.Name,
        id: listMetadata.Id,
        objectType,
        rawData: listMetadata,
      },
      pagination: {
        total_count: totalCount,
        next: encodeCursor({
          id: (response.records.length ? response.records[response.records.length - 1].Id : null) as string,
          reverse: false,
        }),
        previous: null,
      },
    };
  }

  public override handleErr(err: unknown): unknown {
    const error = err as any;

    // jsforce doesn't provide a stable jsonapi "title" so infer it from the message.
    // assumed format: "Some Title: Array of json details" or "Some Title"
    const inferredTitle = error.message.substring(
      0,
      error.message.includes(':') ? error.message.indexOf(':') : error.message.length
    );

    // https://developer.salesforce.com/docs/atlas.en-us.210.0.object_reference.meta/object_reference/sforce_api_calls_concepts_core_data_objects.htm#i1421192
    switch (error.errorCode) {
      case 'DUPLICATE_VALUE':
      case 'ERROR_HTTP_400':
      case 'INVALID_CROSS_REFERENCE_KEY':
      case 'INVALID_FIELD':
      case 'INVALID_OPERATION':
      case 'INVALID_TYPE':
      case 'MALFORMED_ID':
      case 'MISSING_ARGUMENT':
        return new InternalServerError(inferredTitle, error);
      case 'INVALID_EMAIL_ADDRESS':
      case 'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST':
      case 'REQUIRED_FIELD_MISSING':
      case 'STRING_TOO_LONG':
      case 'TOO_MANY_ENUM_VALUE':
        return new BadRequestError(inferredTitle, error);
      case 'INVALID_ID_FIELD':
      case 'INVALID_LOCATOR':
      case 'ERROR_HTTP_404':
      case 'NOT_FOUND':
        return new NotFoundError(inferredTitle, error);
      case 'CLIENT_NOT_ACCESSIBLE_FOR_USER':
      case 'INSUFFICIENT_ACCESS':
      case 'sf:INSUFFICIENT_ACCESS': // SOAP api returns this
      case 'ERROR_HTTP_403':
      case 'API_DISABLED_FOR_ORG':
        return new ForbiddenError(inferredTitle, error);
      case 'ERROR_HTTP_401':
        return new UnauthorizedError(inferredTitle, error);
      case 'NOT_MODIFIED':
      case 'ERROR_HTTP_304':
        return new NotModifiedError(inferredTitle, error);
      case 'ERROR_HTTP_503':
        return new BadGatewayError('Salesforce API is temporarily unavailable', error);
      // The following are unmapped to Supaglue errors, but we want to pass
      // them back as 4xx so they aren't 500 and developers can view error messages
      case 'ALL_OR_NONE_OPERATION_ROLLED_BACK':
      case 'ALREADY_IN_PROCESS':
      case 'ASSIGNEE_TYPE_REQUIRED':
      case 'BAD_CUSTOM_ENTITY_PARENT_DOMAIN':
      case 'BCC_NOT_ALLOWED_IF_BCC_COMPLIANCE_ENABLED':
      case 'BCC_SELF_NOT_ALLOWED_IF_BCC_COMPLIANCE_ENABLED':
      case 'CANNOT_CASCADE_PRODUCT_ACTIVE':
      case 'CANNOT_CHANGE_FIELD_TYPE_OF_APEX_REFERENCED_FIELD':
      case 'CANNOT_CREATE_ANOTHER_MANAGED_PACKAGE':
      case 'CANNOT_DEACTIVATE_DIVISION':
      case 'CANNOT_DELETE_LAST_DATED_CONVERSION_RATE':
      case 'CANNOT_DELETE_MANAGED_OBJECT':
      case 'CANNOT_DISABLE_LAST_ADMIN':
      case 'CANNOT_ENABLE_IP_RESTRICT_REQUESTS':
      case 'CANNOT_INSERT_UPDATE_ACTIVATE_ENTITY':
      case 'CANNOT_MODIFY_MANAGED_OBJECT':
      case 'CANNOT_RENAME_APEX_REFERENCED_FIELD':
      case 'CANNOT_RENAME_APEX_REFERENCED_OBJECT':
      case 'CANNOT_REPARENT_RECORD':
      case 'CANNOT_RESOLVE_NAME':
      case 'CANNOT_UPDATE_CONVERTED_LEAD':
      case 'CANT_DISABLE_CORP_CURRENCY':
      case 'CANT_UNSET_CORP_CURRENCY':
      case 'CHILD_SHARE_FAILS_PARENT':
      case 'CIRCULAR_DEPENDENCY':
      case 'COMMUNITY_NOT_ACCESSIBLE':
      case 'CUSTOM_CLOB_FIELD_LIMIT_EXCEEDED':
      case 'CUSTOM_ENTITY_OR_FIELD_LIMIT':
      case 'CUSTOM_FIELD_INDEX_LIMIT_EXCEEDED':
      case 'CUSTOM_INDEX_EXISTS':
      case 'CUSTOM_LINK_LIMIT_EXCEEDED':
      case 'CUSTOM_METADATA_LIMIT_EXCEEDED':
      case 'CUSTOM_SETTINGS_LIMIT_EXCEEDED':
      case 'CUSTOM_TAB_LIMIT_EXCEEDED':
      case 'DELETE_FAILED':
      case 'DEPENDENCY_EXISTS':
      case 'DUPLICATE_CASE_SOLUTION':
      case 'DUPLICATE_CUSTOM_ENTITY_DEFINITION':
      case 'DUPLICATE_CUSTOM_TAB_MOTIF':
      case 'DUPLICATE_DEVELOPER_NAME':
      case 'DUPLICATES_DETECTED':
      case 'DUPLICATE_EXTERNAL_ID':
      case 'DUPLICATE_MASTER_LABEL':
      case 'DUPLICATE_SENDER_DISPLAY_NAME':
      case 'DUPLICATE_USERNAME':
      case 'EMAIL_ADDRESS_BOUNCED':
      case 'EMAIL_NOT_PROCESSED_DUE_TO_PRIOR_ERROR':
      case 'EMAIL_OPTED_OUT':
      case 'EMAIL_TEMPLATE_FORMULA_ERROR':
      case 'EMAIL_TEMPLATE_MERGEFIELD_ACCESS_ERROR':
      case 'EMAIL_TEMPLATE_MERGEFIELD_ERROR':
      case 'EMAIL_TEMPLATE_MERGEFIELD_VALUE_ERROR':
      case 'EMAIL_TEMPLATE_PROCESSING_ERROR':
      case 'EMPTY_SCONTROL_FILE_NAME':
      case 'ENTITY_FAILED_IFLASTMODIFIED_ON_UPDATE':
      case 'ENTITY_IS_ARCHIVED':
      case 'ENTITY_IS_DELETED':
      case 'ENTITY_IS_LOCKED':
      case 'ENVIRONMENT_HUB_MEMBERSHIP_CONFLICT':
      case 'ERROR_IN_MAILER':
      case 'FAILED_ACTIVATION':
      case 'FIELD_CUSTOM_VALIDATION_EXCEPTION':
      case 'FIELD_FILTER_VALIDATION_EXCEPTION':
      case 'FILTERED_LOOKUP_LIMIT_EXCEEDED':
      case 'HTML_FILE_UPLOAD_NOT_ALLOWED':
      case 'IMAGE_TOO_LARGE':
      case 'INACTIVE_OWNER_OR_USER':
      case 'INSERT_UPDATE_DELETE_NOT_ALLOWED_DURING_MAINTENANCE':
      case 'INSUFFICIENT_ACCESS_ON_CROSS_REFERENCE_ENTITY':
      case 'INSUFFICIENT_ACCESS_OR_READONLY':
      case 'INVALID_ACCESS_LEVEL':
      case 'INVALID_ARGUMENT_TYPE':
      case 'INVALID_ASSIGNEE_TYPE':
      case 'INVALID_ASSIGNMENT_RULE':
      case 'INVALID_BATCH_OPERATION':
      case 'INVALID_CONTENT_TYPE':
      case 'INVALID_CREDIT_CARD_INFO':
      case 'INVALID_CROSS_REFERENCE_TYPE_FOR_FIELD':
      case 'INVALID_CURRENCY_CONV_RATE':
      case 'INVALID_CURRENCY_CORP_RATE':
      case 'INVALID_CURRENCY_ISO':
      case 'INVALID_EMPTY_KEY_OWNER':
      case 'INVALID_EVENT_SUBSCRIPTION':
      case 'INVALID_FIELD_FOR_INSERT_UPDATE':
      case 'INVALID_FIELD_WHEN_USING_TEMPLATE':
      case 'INVALID_FILTER_ACTION':
      case 'INVALID_INET_ADDRESS':
      case 'INVALID_LINEITEM_CLONE_STATE':
      case 'INVALID_MASTER_OR_TRANSLATED_SOLUTION':
      case 'INVALID_MESSAGE_ID_REFERENCE':
      case 'INVALID_OPERATOR':
      case 'INVALID_PARTNER_NETWORK_STATUS':
      case 'INVALID_PERSON_ACCOUNT_OPERATION':
      case 'INVALID_READ_ONLY_USER_DML':
      case 'INVALID_SAVE_AS_ACTIVITY_FLAG':
      case 'INVALID_SESSION_ID':
      case 'INVALID_STATUS':
      case 'INVALID_TYPE_FOR_OPERATION':
      case 'INVALID_TYPE_ON_FIELD_IN_RECORD':
      case 'IP_RANGE_LIMIT_EXCEEDED':
      case 'JIGSAW_IMPORT_LIMIT_EXCEEDED':
      case 'LICENSE_LIMIT_EXCEEDED':
      case 'LIGHT_PORTAL_USER_EXCEPTION':
      case 'LIMIT_EXCEEDED':
      case 'LOGIN_CHALLENGE_ISSUED':
      case 'LOGIN_CHALLENGE_PENDING':
      case 'LOGIN_MUST_USE_SECURITY_TOKEN':
      case 'MANAGER_NOT_DEFINED':
      case 'MASSMAIL_RETRY_LIMIT_EXCEEDED':
      case 'MASS_MAIL_LIMIT_EXCEEDED':
      case 'MAXIMUM_CCEMAILS_EXCEEDED':
      case 'MAXIMUM_DASHBOARD_COMPONENTS_EXCEEDED':
      case 'MAXIMUM_HIERARCHY_LEVELS_REACHED':
      case 'MAXIMUM_SIZE_OF_ATTACHMENT':
      case 'MAXIMUM_SIZE_OF_DOCUMENT':
      case 'MAX_ACTIONS_PER_RULE_EXCEEDED':
      case 'MAX_ACTIVE_RULES_EXCEEDED':
      case 'MAX_APPROVAL_STEPS_EXCEEDED':
      case 'MAX_FORMULAS_PER_RULE_EXCEEDED':
      case 'MAX_RULES_EXCEEDED':
      case 'MAX_RULE_ENTRIES_EXCEEDED':
      case 'MAX_TASK_DESCRIPTION_EXCEEDED':
      case 'MAX_TM_RULES_EXCEEDED':
      case 'MAX_TM_RULE_ITEMS_EXCEEDED':
      case 'MERGE_FAILED':
      case 'NONUNIQUE_SHIPPING_ADDRESS':
      case 'NO_APPLICABLE_PROCESS':
      case 'NO_ATTACHMENT_PERMISSION':
      case 'NO_INACTIVE_DIVISION_MEMBERS':
      case 'NO_MASS_MAIL_PERMISSION':
      case 'NUMBER_OUTSIDE_VALID_RANGE':
      case 'NUM_HISTORY_FIELDS_BY_SOBJECT_EXCEEDED':
      case 'OP_WITH_INVALID_USER_TYPE_EXCEPTION':
      case 'OPTED_OUT_OF_MASS_MAIL':
      case 'PACKAGE_LICENSE_REQUIRED':
      case 'PORTAL_USER_ALREADY_EXISTS_FOR_CONTACT':
      case 'PRIVATE_CONTACT_ON_ASSET':
      case 'RECORD_IN_USE_BY_WORKFLOW':
      case 'REQUEST_RUNNING_TOO_LONG':
      case 'SELF_REFERENCE_FROM_TRIGGER':
      case 'SHARE_NEEDED_FOR_CHILD_OWNER':
      case 'SINGLE_EMAIL_LIMIT_EXCEEDED':
      case 'STANDARD_PRICE_NOT_DEFINED':
      case 'STORAGE_LIMIT_EXCEEDED':
      case 'TABSET_LIMIT_EXCEEDED':
      case 'TEMPLATE_NOT_ACTIVE':
      case 'TERRITORY_REALIGN_IN_PROGRESS':
      case 'TEXT_DATA_OUTSIDE_SUPPORTED_CHARSET':
      case 'TOO_MANY_APEX_REQUESTS':
      case 'TRANSFER_REQUIRES_READ':
      case 'UNABLE_TO_LOCK_ROW':
      case 'UNAVAILABLE_RECORDTYPE_EXCEPTION':
      case 'UNDELETE_FAILED':
      case 'UNKNOWN_EXCEPTION':
      case 'UNSPECIFIED_EMAIL_ADDRESS':
      case 'UNSUPPORTED_APEX_TRIGGER_OPERATION':
      case 'UNVERIFIED_SENDER_ADDRESS':
      case 'WEBLINK_SIZE_LIMIT_EXCEEDED':
      case 'WEBLINK_URL_INVALID':
      case 'WRONG_CONTROLLER_TYPE':
        return new RemoteProviderError(inferredTitle, error);
      default:
        return error;
    }
  }
}

export function newClient(connection: ConnectionUnsafe<'salesforce'>, provider: Provider): SalesforceClient {
  return new SalesforceClient({
    instanceUrl: connection.credentials.instanceUrl,
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    clientId: (provider as CRMProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as CRMProvider).config.oauth.credentials.oauthClientSecret,
    loginUrl: connection.credentials.loginUrl,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://login.salesforce.com',
  tokenPath: '/services/oauth2/token',
  authorizeHost: 'https://login.salesforce.com',
  authorizePath: '/services/oauth2/authorize',
};

function capitalizeString(str: string): string {
  if (!str) {
    return str;
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}
