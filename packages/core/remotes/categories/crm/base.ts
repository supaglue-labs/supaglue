import type { CommonObjectDef, StandardOrCustomObjectDef } from '@supaglue/types';
import type { CRMCommonObjectType, CRMCommonObjectTypeMap } from '@supaglue/types/crm';
import type { Association, AssociationCreateParams } from '@supaglue/types/crm/association';
import type { AssociationType, AssociationTypeCreateParams, SGObject } from '@supaglue/types/crm/association_type';
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
import { Readable } from 'stream';
import type { RemoteClient } from '../../base';
import { AbstractRemoteClient } from '../../base';

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
