import type { PaginationParams } from '@supaglue/types';
import type {
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  ListCRMCommonObject,
  ListCRMCommonObjectTypeMap,
  ListMetadata,
} from '@supaglue/types/crm';
import type { AllCrmFieldMappingConfigs, FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { Readable } from 'stream';
import { NotImplementedError } from '../../../errors';
import type { PaginatedSupaglueRecords } from '../../../lib';
import type { RemoteClient } from '../../base';
import { AbstractRemoteClient } from '../../base';

export interface CrmRemoteClient extends RemoteClient {
  streamCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void,
    associationsToFetch?: string[]
  ): Promise<Readable>;
  getCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    id: string,
    allFieldMappingConfigs: AllCrmFieldMappingConfigs,
    params: CRMCommonObjectTypeMap<T>['getParams']
  ): Promise<CRMCommonObjectTypeMap<T>['object']>;
  createCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string>;
  updateCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<string>;
  upsertCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['upsertParams']
  ): Promise<string>;
  searchCommonObjectRecords<T extends CRMCommonObjectType>(
    commonObjectType: T,
    fieldMappingConfig: FieldMappingConfig,
    params: CRMCommonObjectTypeMap<T>['searchParams']
  ): Promise<PaginatedSupaglueRecords<CRMCommonObjectTypeMap<T>['object']>>;
  listCommonObjectRecords<T extends CRMCommonObjectType>(
    commonObjectType: CRMCommonObjectType,
    allFieldMappingConfigs: AllCrmFieldMappingConfigs,
    params: CRMCommonObjectTypeMap<T>['listParams']
  ): Promise<PaginatedSupaglueRecords<CRMCommonObjectTypeMap<T>['object']>>;

  listLists(
    objectType: ListCRMCommonObject,
    paginationParams: PaginationParams
  ): Promise<PaginatedSupaglueRecords<ListMetadata>>;

  listListMembership<T extends ListCRMCommonObject>(
    objectType: T,
    listId: string,
    paginationParams: PaginationParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<ListCRMCommonObjectTypeMap<T>>>;
}

export abstract class AbstractCrmRemoteClient extends AbstractRemoteClient implements CrmRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public async streamCommonObjectRecords(
    commonObjectType: CRMCommonObjectType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date,
    heartbeat?: () => void,
    associationsToFetch?: string[]
  ): Promise<Readable> {
    throw new NotImplementedError();
  }
  public async getCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    id: string,
    allFieldMappingConfigs: AllCrmFieldMappingConfigs,
    params: CRMCommonObjectTypeMap<T>['getParams']
  ): Promise<CRMCommonObjectTypeMap<T>['object']> {
    throw new NotImplementedError();
  }
  public async createCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    throw new NotImplementedError();
  }
  public async updateCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['updateParams']
  ): Promise<string> {
    throw new NotImplementedError();
  }
  public async upsertCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['upsertParams']
  ): Promise<string> {
    throw new NotImplementedError();
  }

  searchCommonObjectRecords<T extends CRMCommonObjectType>(
    commonObjectType: T,
    fieldMappingConfig: FieldMappingConfig,
    params: CRMCommonObjectTypeMap<T>['searchParams']
  ): Promise<PaginatedSupaglueRecords<CRMCommonObjectTypeMap<T>['object']>> {
    throw new NotImplementedError();
  }

  listCommonObjectRecords<T extends CRMCommonObjectType>(
    commonObjectType: CRMCommonObjectType,
    allFieldMappingConfigs: AllCrmFieldMappingConfigs,
    params: CRMCommonObjectTypeMap<T>['listParams']
  ): Promise<PaginatedSupaglueRecords<CRMCommonObjectTypeMap<T>['object']>> {
    throw new NotImplementedError();
  }

  public async listLists(
    objectType: ListCRMCommonObject,
    paginationParams: PaginationParams
  ): Promise<PaginatedSupaglueRecords<ListMetadata>> {
    throw new NotImplementedError();
  }

  public async listListMembership<T extends ListCRMCommonObject>(
    objectType: T,
    listId: string,
    paginationParams: PaginationParams,
    fieldMappingConfig: FieldMappingConfig
  ): Promise<PaginatedSupaglueRecords<ListCRMCommonObjectTypeMap<T>>> {
    throw new NotImplementedError();
  }
}
