import { CommonObjectDef, ConnectionUnsafe, CRMProvider, StandardOrCustomObjectDef } from '@supaglue/types';
import { CRMCommonObjectType, CRMCommonObjectTypeMap, CRMProviderName } from '@supaglue/types/crm';
import { Association, AssociationCreateParams } from '@supaglue/types/crm/association';
import { AssociationType, AssociationTypeCreateParams, SGObject } from '@supaglue/types/crm/association_type';
import { CustomObject, CustomObjectCreateParams, CustomObjectUpdateParams } from '@supaglue/types/crm/custom_object';
import {
  CustomObjectRecord,
  CustomObjectRecordCreateParams,
  CustomObjectRecordUpdateParams,
} from '@supaglue/types/crm/custom_object_record';
import { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { ConnectorAuthConfig } from '..';
import { AbstractRemoteClient, RemoteClient } from '../base';
import * as capsule from '../impl/capsule';
import * as hubspot from '../impl/hubspot';
import * as ms_dynamics_365_sales from '../impl/ms_dynamics_365_sales';
import * as pipedrive from '../impl/pipedrive';
import * as salesforce from '../impl/salesforce';
import * as zendesk_sell from '../impl/zendesk_sell';
import * as zoho_crm from '../impl/zoho_crm';

export interface CrmRemoteClient extends RemoteClient {
  listCommonProperties(object: CommonObjectDef): Promise<string[]>;
  listProperties(object: StandardOrCustomObjectDef): Promise<string[]>;

  listCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable>;
  getCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    id: string,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<CRMCommonObjectTypeMap<T>['object']>;
  createCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string>;
  updateCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<string>;

  getCustomObject(id: string): Promise<CustomObject>;
  createCustomObject(params: CustomObjectCreateParams): Promise<string>;
  updateCustomObject(params: CustomObjectUpdateParams): Promise<void>;

  getCustomObjectRecord(objectId: string, id: string): Promise<CustomObjectRecord>;
  createCustomObjectRecord(params: CustomObjectRecordCreateParams): Promise<string>;
  updateCustomObjectRecord(params: CustomObjectRecordUpdateParams): Promise<void>;

  getAssociationTypes(sourceObject: SGObject, targetObject: SGObject): Promise<AssociationType[]>;
  createAssociationType(params: AssociationTypeCreateParams): Promise<void>;

  createAssociation(params: AssociationCreateParams): Promise<Association>;
}

export abstract class AbstractCrmRemoteClient extends AbstractRemoteClient implements CrmRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public listCommonProperties(object: CommonObjectDef): Promise<string[]> {
    throw new Error('Not implemented');
  }
  public listProperties(object: StandardOrCustomObjectDef): Promise<string[]> {
    throw new Error('Not implemented');
  }

  public async listStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async listCustomObjectRecords(
    object: string,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public async listCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    throw new Error('Not implemented');
  }
  public async getCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    id: string,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }
  public async createCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }
  public async updateCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }

  public async getCustomObject(id: string): Promise<CustomObject> {
    throw new Error('Not implemented');
  }
  public async createCustomObject(params: CustomObjectCreateParams): Promise<string> {
    throw new Error('Not implemented');
  }
  public async updateCustomObject(params: CustomObjectUpdateParams): Promise<void> {
    throw new Error('Not implemented');
  }

  public async getCustomObjectRecord(objectId: string, id: string): Promise<CustomObjectRecord> {
    throw new Error('Not implemented');
  }
  public async createCustomObjectRecord(params: CustomObjectRecordCreateParams): Promise<string> {
    throw new Error('Not implemented');
  }
  public async updateCustomObjectRecord(params: CustomObjectRecordUpdateParams): Promise<void> {
    throw new Error('Not implemented');
  }

  public async getAssociationTypes(sourceObject: SGObject, targetObject: SGObject): Promise<AssociationType[]> {
    throw new Error('Not implemented');
  }
  public async createAssociationType(params: AssociationTypeCreateParams): Promise<void> {
    throw new Error('Not implemented');
  }

  public async createAssociation(params: AssociationCreateParams): Promise<Association> {
    throw new Error('Not implemented');
  }
}
export abstract class CrmRemoteClientEventEmitter extends EventEmitter {}

export type CrmConnectorConfig<T extends CRMProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, provider: CRMProvider) => AbstractCrmRemoteClient;
};

export const crmConnectorConfigMap: {
  [K in CRMProviderName]: CrmConnectorConfig<K>;
} = {
  salesforce,
  hubspot,
  pipedrive,
  zendesk_sell,
  ms_dynamics_365_sales,
  capsule,
  zoho_crm,
};

export function getCrmRemoteClient<T extends CRMProviderName>(
  connection: ConnectionUnsafe<T>,
  provider: CRMProvider
): CrmRemoteClient {
  const { newClient } = crmConnectorConfigMap[connection.providerName];
  const client = newClient(connection, provider);

  // Intercept and log errors to remotes
  return new Proxy(client, {
    get(target, p) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const v = target[p];
      if (typeof v !== 'function') {
        return v;
      }

      return new Proxy(v, {
        apply(_target, thisArg, argArray) {
          try {
            const res = v.apply(target, argArray);
            if (Promise.resolve(res) === res) {
              // if it's a promise
              return (res as Promise<unknown>).catch((err) => {
                throw target.handleErr(err);
              });
            }
            return res;
          } catch (err: unknown) {
            throw target.handleErr(err);
          }
        },
      });
    },
  });
}
