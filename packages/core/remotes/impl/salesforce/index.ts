// fetch methods / types not present in @types/node yet
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/60924
/// <reference lib="dom" />

import type {
  CommonObjectDef,
  ConnectionUnsafe,
  NormalizedRawRecord,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
  StandardOrCustomObjectDef,
} from '@supaglue/types';
import type {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  Lead,
  LeadCreateParams,
  LeadUpdateParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityUpdateParams,
  User,
} from '@supaglue/types/crm';
import type {
  CustomObject,
  CustomObjectCreateParams,
  CustomObjectUpdateParams,
} from '@supaglue/types/crm/custom_object';
import type {
  CustomObjectRecord,
  CustomObjectRecordCreateParams,
  CustomObjectRecordUpdateParams,
} from '@supaglue/types/crm/custom_object_record';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import retry from 'async-retry';
import { parse } from 'csv-parse';
import * as jsforce from 'jsforce';
import { pipeline, Readable, Transform } from 'stream';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  NotModifiedError,
  TooManyRequestsError,
  UnauthorizedError,
} from '../../../errors';
import { ASYNC_RETRY_OPTIONS, intersection, logger } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';
import { paginator } from '../../utils/paginator';
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

  async getStandardPropertiesToFetch(object: string, fieldMappingConfig?: FieldMappingConfig): Promise<string[]> {
    const sobject = capitalizeString(object);
    const allProperties = await this.getSObjectProperties(sobject);
    if (!fieldMappingConfig || fieldMappingConfig.type === 'inherit_all_fields') {
      return allProperties;
    }
    return intersection(
      allProperties,
      fieldMappingConfig.fieldMappings.map((fieldMapping) => fieldMapping.mappedField)
    );
  }

  public override async listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    const propertiesToFetch = await this.getStandardPropertiesToFetch(object, fieldMappingConfig);
    const stream = await this.#listObjectsHelper(object, propertiesToFetch, modifiedAfter, heartbeat);

    return pipeline(
      stream,
      new Transform({
        objectMode: true,
        transform: (chunk, encoding, callback) => {
          // TODO: types
          const { record, emittedAt } = chunk;
          // not declaring this in-line so we have the opportunity to do type checking
          const emittedRecord: NormalizedRawRecord = {
            id: record.Id,
            rawData: toMappedProperties(record, fieldMappingConfig),
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
    modifiedAfter?: Date | undefined,
    heartbeat?: (() => void) | undefined
  ): Promise<Readable> {
    return await this.listStandardObjectRecords(
      `${object}__c`,
      // TODO: Support customer field mappings for custom objects.
      { type: 'inherit_all_fields' },
      modifiedAfter,
      heartbeat
    );
  }

  async getCommonPropertiesToFetch(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig?: FieldMappingConfig
  ): Promise<string[]> {
    const sobject = capitalizeString(commonObjectType);
    const allProperties = await this.getSObjectProperties(sobject);
    if (!fieldMappingConfig || fieldMappingConfig.type === 'inherit_all_fields') {
      return allProperties;
    }
    return intersection(allProperties, [
      ...propertiesForCommonObject[commonObjectType],
      ...fieldMappingConfig.fieldMappings.map((fieldMapping) => fieldMapping.mappedField),
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
      throw new Error('Custom object id must end with __c');
    }

    const metadata = await this.#client.metadata.read('CustomObject', id);
    return toCustomObject(metadata);
  }

  public override async createCustomObject(params: CustomObjectCreateParams): Promise<string> {
    if (!params.name.endsWith('__c')) {
      // Salesforce doesn't actually enforce this, and will just append __c.
      // However, we want to enforce this to avoid confusion when using
      // the custom object name in other places.
      throw new Error('Custom object name must end with __c');
    }

    if (!params.fields.length) {
      throw new Error('Cannot create custom object with no fields');
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

    if (results.some((result) => !result.success)) {
      // TODO: creating the object and the fields is not an atomic operation.
      // If it fails halfway, we should return some message to the user educating them
      // to call the PUT endpoint next instead
      throw new Error(`Failed to create custom object: ${JSON.stringify(results, null, 2)}`);
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
      throw new Error('Custom object name must end with __c');
    }

    if (!params.fields.length) {
      throw new Error('Cannot create custom object with no fields');
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
    const existingObjectNonPrimaryFields = existingObject.fields.filter(
      (field) => field.keyName !== existingObject.primaryFieldKeyName
    );

    // Calculate which fields got added, updated, or deleted
    const addedFields = nonPrimaryFields.filter(
      (field) => !existingObjectNonPrimaryFields.some((existingField) => existingField.keyName === field.keyName)
    );
    const updatedFields = nonPrimaryFields.filter((field) =>
      existingObjectNonPrimaryFields.some(
        (existingField) =>
          existingField.keyName === field.keyName &&
          (existingField.displayName !== field.displayName ||
            existingField.fieldType !== field.fieldType ||
            existingField.isRequired !== field.isRequired)
      )
    );
    const deletedFields = existingObjectNonPrimaryFields.filter(
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
      // We're not using metadata.create('CustomField') because it doesn't automatically
      // make the field visible/accessible to all the profiles, which would require another
      // call. If we don't make that second permissions-related call, we won't be able to use
      // the field.
      // TODO: find out a better way of doing this
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
          fields: addedFields.map((field) => {
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
      // Check the results. If there are errors but they don't have to do with the fields
      // we're adding, ignore them.
      // Sample results:
      // [
      //   {
      //     "errors": [
      //       {
      //         "fields": [
      //           "DeveloperName"
      //         ],
      //         "message": "That object name is already in use.",
      //         "statusCode": "DUPLICATE_DEVELOPER_NAME",
      //         "extendedErrorDetails": []
      //       }
      //     ],
      //     "fullName": "cups__c",
      //     "success": false
      //   },
      //   {
      //     "fullName": "cups__c.field7__c",
      //     "success": true,
      //     "errors": []
      //   }
      // ]
      const fullyQualifiedAddedFieldNames = addedFields.map((field) => `${params.name}.${field.keyName}`);
      for (const result of results) {
        if (result.success) {
          continue;
        }

        if (fullyQualifiedAddedFieldNames.includes(result.fullName)) {
          throw new Error(`Failed to create custom fields: ${JSON.stringify(results, null, 2)}`);
        }
      }
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

  // const account = await this.#client.retrieve('Account', id);
  //   return { ...fromSalesforceAccountToAccount(account), rawData: toMappedProperties(account, fieldMappingConfig) };
  // }

  // public async createAccount(params: AccountCreateParams): Promise<string> {
  //   const response = await this.#client.create('Account', toSalesforceAccountCreateParams(params));
  //   if (!response.success) {
  //     throw new Error('Failed to create Salesforce account');
  //   }
  //   return response.id;
  // }

  // public async updateAccount(params: AccountUpdateParams): Promise<string> {
  //   const response = await this.#client.update('Account', toSalesforceAccountUpdateParams(params));
  //   if (!response.success) {
  //     throw new Error('Failed to update Salesforce account');
  //   }
  //   return response.id;

  public async getCustomObjectRecord(objectId: string, id: string): Promise<CustomObjectRecord> {
    const record = await this.#client.retrieve(objectId, id);

    if (!record.Id) {
      throw new NotFoundError(`Unexpectedly record was not returned with ${record.Id}`);
    }

    // Get the properties to fetch
    // TODO: should we be returning other properties too?
    const customObject = await this.getCustomObject(objectId);
    const fieldsToFetch = customObject.fields.map((field) => field.keyName);

    return {
      id: record.Id,
      objectId,
      fields: Object.fromEntries(Object.entries(record).filter(([key]) => fieldsToFetch.includes(key))),
    };
  }

  public async createCustomObjectRecord({ objectId, fields }: CustomObjectRecordCreateParams): Promise<string> {
    const result = await this.#client.create(objectId, fields);
    if (!result.success) {
      throw new Error(
        `Failed to create Salesforce custom object ${objectId} record: ${JSON.stringify(result.errors, null, 2)}`
      );
    }
    return result.id;
  }

  public async updateCustomObjectRecord({ objectId, id, fields }: CustomObjectRecordUpdateParams): Promise<void> {
    const result = await this.#client.update(objectId, {
      Id: id,
      ...fields,
    });
    if (!result.success) {
      throw new Error(
        `Failed to update Salesforce custom object ${objectId} record: ${JSON.stringify(result.errors, null, 2)}`
      );
    }
  }

  async #refreshAccessToken(): Promise<void> {
    // TODO: Shouldn't be relying on `jsforce` to do this.
    const token = await this.#client.oauth2.refreshToken(this.#refreshToken);
    this.#accessToken = token.access_token;
    this.emit('token_refreshed', token.access_token, null);
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
    const response = await this.#fetch('/services/data/v57.0/jobs/query', {
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
      const response = await this.#fetch(`/services/data/v57.0/jobs/query/${jobId}`, {
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

    return await this.#fetch(`/services/data/v57.0/jobs/query/${jobId}/results?${params}`, {
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

  public override async listCommonProperties(object: CommonObjectDef): Promise<string[]> {
    const sobject = capitalizeString(object.name);
    return await this.getSObjectProperties(sobject);
  }

  public override async listProperties(object: StandardOrCustomObjectDef): Promise<string[]> {
    const sobject = object.type === 'custom' ? capitalizeString(`${object.name}__c`) : capitalizeString(object.name);
    return await this.getSObjectProperties(sobject);
  }

  private async getSObjectProperties(sobject: string): Promise<string[]> {
    const response = await this.#fetch(`/services/data/v57.0/sobjects/${sobject}/describe`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const responseJson = await response.json();
    return responseJson.fields
      .filter((field: { type: string }) => !COMPOUND_TYPES.includes(field.type))
      .map((field: { name: string; type: string }) => field.name);
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

  public override handleErr(err: unknown): unknown {
    const error = err as any;
    // codes from:
    // https://developer.salesforce.com/docs/atlas.en-us.210.0.object_reference.meta/object_reference/sforce_api_calls_concepts_core_data_objects.htm#i1421192
    switch (error.errorCode) {
      case 'REQUIRED_FIELD_MISSING':
      case 'STRING_TOO_LONG':
      case 'INVALID_CROSS_REFERENCE_KEY':
      case 'DUPLICATE_VALUE':
      case 'INVALID_FIELD':
      case 'INVALID_OPERATION':
      case 'INVALID_TYPE':
      case 'MISSING_ARGUMENT':
      case 'MALFORMED_ID':
      case 'INVALID_EMAIL_ADDRESS':
      case 'ERROR_HTTP_400':
        return new BadRequestError(error.message);
      case 'INVALID_ID_FIELD':
      case 'INVALID_LOCATOR':
      case 'ERROR_HTTP_404':
      case 'NOT_FOUND':
        return new NotFoundError(error.message);
      case 'CLIENT_NOT_ACCESSIBLE_FOR_USER':
      case 'INSUFFICIENT_ACCESS':
      case 'ERROR_HTTP_403':
      case 'API_DISABLED_FOR_ORG':
        return new ForbiddenError(error.message);
      case 'ERROR_HTTP_401':
        return new UnauthorizedError(error.message);
      case 'NOT_MODIFIED':
      case 'ERROR_HTTP_304':
        return new NotModifiedError(error.message);
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
    clientId: provider.config.oauth.credentials.oauthClientId,
    clientSecret: provider.config.oauth.credentials.oauthClientSecret,
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

function toMappedProperties(
  properties: Record<string, any>,
  fieldMappingConfig: FieldMappingConfig
): Record<string, any> {
  if (fieldMappingConfig.type === 'inherit_all_fields') {
    return properties;
  }

  return Object.fromEntries(
    fieldMappingConfig.fieldMappings.map(({ schemaField, mappedField }) => [schemaField, properties[mappedField]])
  );
}
