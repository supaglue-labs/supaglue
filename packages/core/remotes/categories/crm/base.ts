import type { PaginatedResult, PaginationParams } from '@supaglue/types';
import type { CRMCommonObjectType, CRMCommonObjectTypeMap, ListMember, ListMetadata } from '@supaglue/types/crm';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { Readable } from 'stream';
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
    objectType: Exclude<CRMCommonObjectType, 'user'>,
    paginationParams: PaginationParams
  ): Promise<PaginatedResult<ListMetadata>>;

  listListMembership(
    objectType: string,
    listId: string,
    paginationParams: PaginationParams
  ): Promise<PaginatedResult<ListMember> & { metadata: ListMetadata }>;
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
    objectType: Exclude<CRMCommonObjectType, 'user'>,
    paginationParams: PaginationParams
  ): Promise<PaginatedResult<ListMetadata>> {
    throw new Error('Not implemented');
  }

  public async listListMembership(
    objectType: string,
    listId: string,
    paginationParams: PaginationParams
  ): Promise<PaginatedResult<ListMember> & { metadata: ListMetadata }> {
    throw new Error('Not implemented');
  }
}
