import type { PaginationParams } from '@supaglue/types';
import type {
  CRMCommonObjectType,
  CRMCommonObjectTypeMap,
  ListCRMCommonObject,
  ListCRMCommonObjectTypeMap,
  ListMetadata,
} from '@supaglue/types/crm';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { Readable } from 'stream';
import type { PaginatedSupaglueRecords } from '../../../lib';
import type { RemoteClient } from '../../base';
import { AbstractRemoteClient } from '../../base';

export interface CrmRemoteClient extends RemoteClient {
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
  upsertCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['upsertParams']
  ): Promise<string>;

  listLists(
    objectType: ListCRMCommonObject,
    paginationParams: PaginationParams
  ): Promise<PaginatedSupaglueRecords<ListMetadata>>;

  listListMembership<T extends ListCRMCommonObject>(
    objectType: T,
    listId: string,
    paginationParams: PaginationParams
  ): Promise<PaginatedSupaglueRecords<ListCRMCommonObjectTypeMap<T>> & { metadata: ListMetadata }>;
}

export abstract class AbstractCrmRemoteClient extends AbstractRemoteClient implements CrmRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
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
  public async upsertCommonObjectRecord<T extends CRMCommonObjectType>(
    commonObjectType: T,
    params: CRMCommonObjectTypeMap<T>['upsertParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }

  public async listLists(
    objectType: ListCRMCommonObject,
    paginationParams: PaginationParams
  ): Promise<PaginatedSupaglueRecords<ListMetadata>> {
    throw new Error('Not implemented');
  }

  public async listListMembership<T extends ListCRMCommonObject>(
    objectType: T,
    listId: string,
    paginationParams: PaginationParams
  ): Promise<PaginatedSupaglueRecords<ListCRMCommonObjectTypeMap<T>> & { metadata: ListMetadata }> {
    throw new Error('Not implemented');
  }
}
