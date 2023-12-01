import type { EngagementCommonObjectType, EngagementCommonObjectTypeMap } from '@supaglue/types/engagement';
import type { Readable } from 'stream';
import { NotImplementedError } from '../../../errors';
import type { PaginatedSupaglueRecords } from '../../../lib/pagination';
import type { RemoteClient } from '../../base';
import { AbstractRemoteClient } from '../../base';

export type CreateCommonObjectRecordResponse<T extends EngagementCommonObjectType> = {
  id: string;
  record?: EngagementCommonObjectTypeMap<T>['object'];
};

export type UpsertCommonObjectRecordResponse<T extends EngagementCommonObjectType> =
  CreateCommonObjectRecordResponse<T>;

export type UpdateCommonObjectRecordResponse<T extends EngagementCommonObjectType> =
  CreateCommonObjectRecordResponse<T>;

export interface EngagementRemoteClient extends RemoteClient {
  streamCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable>;
  getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']>;
  listCommonObjectRecords<T extends EngagementCommonObjectType>(
    commonObjectType: EngagementCommonObjectType,
    params: EngagementCommonObjectTypeMap<T>['listParams']
  ): Promise<PaginatedSupaglueRecords<EngagementCommonObjectTypeMap<T>['object']>>;
  createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<CreateCommonObjectRecordResponse<T>>;
  upsertCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['upsertParams']
  ): Promise<UpsertCommonObjectRecordResponse<T>>;
  updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<UpdateCommonObjectRecordResponse<T>>;

  batchCreateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: Array<EngagementCommonObjectTypeMap<T>['createParams']>
  ): Promise<Array<CreateCommonObjectRecordResponse<T>>>;

  searchCommonObjectRecords<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['searchParams']
  ): Promise<PaginatedSupaglueRecords<EngagementCommonObjectTypeMap<T>['object']>>;
}

export abstract class AbstractEngagementRemoteClient extends AbstractRemoteClient implements EngagementRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public async handleErr(err: unknown): Promise<unknown> {
    return err;
  }

  public async streamCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    throw new NotImplementedError();
  }
  public async getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']> {
    throw new NotImplementedError();
  }
  listCommonObjectRecords<T extends EngagementCommonObjectType>(
    commonObjectType: EngagementCommonObjectType,
    params: EngagementCommonObjectTypeMap<T>['listParams']
  ): Promise<PaginatedSupaglueRecords<EngagementCommonObjectTypeMap<T>['object']>> {
    throw new NotImplementedError();
  }
  public async createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<CreateCommonObjectRecordResponse<T>> {
    throw new NotImplementedError();
  }
  public async upsertCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['upsertParams']
  ): Promise<UpsertCommonObjectRecordResponse<T>> {
    throw new NotImplementedError();
  }
  public async updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<UpdateCommonObjectRecordResponse<T>> {
    throw new NotImplementedError();
  }

  batchCreateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: Array<EngagementCommonObjectTypeMap<T>['createParams']>
  ): Promise<Array<CreateCommonObjectRecordResponse<T>>> {
    throw new NotImplementedError();
  }

  searchCommonObjectRecords<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['searchParams']
  ): Promise<PaginatedSupaglueRecords<EngagementCommonObjectTypeMap<T>['object']>> {
    throw new NotImplementedError();
  }
}
