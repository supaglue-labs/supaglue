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
import { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface CrmRemoteClient extends RemoteClient {
  category(): ProviderCategory;

  listRawStandardObjectRecords(
    object: string,
    fieldMappingConfig: FieldMappingConfig,
    modifiedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable>;
  listCustomObjectRecords(object: string, modifiedAfter?: Date, heartbeat?: () => void): Promise<Readable>;
  listCommonObjectRecords(
    commonModelType: CRMCommonModelType,
    updatedAfter?: Date,
    heartbeat?: () => void,
    fetchAllFields?: boolean
  ): Promise<Readable>;

  getCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']>;
  createCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  updateCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
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

  public category(): ProviderCategory {
    return 'crm';
  }

  public handleErr(err: unknown): unknown {
    return err;
  }

  public async listRawStandardObjectRecords(
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

  abstract listCommonObjectRecords(
    commonModelType: CRMCommonModelType,
    updatedAfter?: Date,
    heartbeat?: () => void,
    fetchAllFields?: boolean
  ): Promise<Readable>;
  abstract getCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']>;
  abstract createCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  abstract updateCommonObjectRecord<T extends CRMCommonModelType>(
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

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
  additionalScopes?: string[];
};

export type CrmConnectorConfig<T extends CRMProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, provider: CRMProvider) => AbstractCrmRemoteClient;
};
