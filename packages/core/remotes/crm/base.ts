import { ConnectionUnsafe, CRMProvider, ProviderCategory } from '@supaglue/types';
import { CRMCommonModelType, CRMCommonModelTypeMap, CRMProviderName } from '@supaglue/types/crm';
import { Association, AssociationCreateParams } from '@supaglue/types/crm/association';
import { AssociationType, AssociationTypeCreateParams, SGObject } from '@supaglue/types/crm/association_type';
import { CustomObject, CustomObjectCreateParams, CustomObjectUpdateParams } from '@supaglue/types/crm/custom_object';
import {
  CustomObjectRecord,
  CustomObjectRecordCreateParams,
  CustomObjectRecordUpdateParams,
} from '@supaglue/types/crm/custom_object_record';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface CrmRemoteClient extends RemoteClient {
  category(): ProviderCategory;

  listRecords(object: string, modifiedAfter?: Date, heartbeat?: () => void): Promise<Readable>;

  listCommonModelRecords(
    commonModelType: CRMCommonModelType,
    updatedAfter?: Date,
    heartbeat?: () => void,
    fetchAllFields?: boolean
  ): Promise<Readable>;
  getCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']>;
  createCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  updateCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<string>;

  getCustomObject(id: string): Promise<CustomObject>;
  createCustomObject(params: CustomObjectCreateParams): Promise<string>;
  updateCustomObject(params: CustomObjectUpdateParams): Promise<void>;

  getCustomRecord(objectId: string, id: string): Promise<CustomObjectRecord>;
  createCustomRecord(params: CustomObjectRecordCreateParams): Promise<string>;
  updateCustomRecord(params: CustomObjectRecordUpdateParams): Promise<void>;

  getAssociationTypes(sourceObject: SGObject, targetObject: SGObject): Promise<AssociationType[]>;
  createAssociationType(params: AssociationTypeCreateParams): Promise<void>;

  createAssociation(params: AssociationCreateParams): Promise<Association>;
}

export abstract class AbstractCrmRemoteClient extends AbstractRemoteClient implements CrmRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public category(): ProviderCategory {
    return 'crm';
  }

  public handleErr(err: unknown): unknown {
    return err;
  }

  public async listRecords(object: string, modifiedAfter?: Date, heartbeat?: () => void): Promise<Readable> {
    throw new Error('Not implemented');
  }

  abstract listCommonModelRecords(
    commonModelType: CRMCommonModelType,
    updatedAfter?: Date,
    heartbeat?: () => void,
    fetchAllFields?: boolean
  ): Promise<Readable>;
  abstract getCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']>;
  abstract createCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  abstract updateCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<string>;

  public async getCustomObject(id: string): Promise<CustomObject> {
    throw new Error('Not implemented');
  }
  public async createCustomObject(params: CustomObjectCreateParams): Promise<string> {
    throw new Error('Not implemented');
  }
  public async updateCustomObject(params: CustomObjectUpdateParams): Promise<void> {
    throw new Error('Not implemented');
  }

  public async getCustomRecord(objectId: string, id: string): Promise<CustomObjectRecord> {
    throw new Error('Not implemented');
  }
  public async createCustomRecord(params: CustomObjectRecordCreateParams): Promise<string> {
    throw new Error('Not implemented');
  }
  public async updateCustomRecord(params: CustomObjectRecordUpdateParams): Promise<void> {
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

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
  authorizeWithScope?: boolean;
};

export type CrmConnectorConfig<T extends CRMProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, provider: CRMProvider) => AbstractCrmRemoteClient;
};
