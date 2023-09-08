import type { EngagementCommonObjectType, EngagementCommonObjectTypeMap } from '@supaglue/types/engagement';
import type { Readable } from 'stream';
import type { RemoteClient } from '../../base';
import { AbstractRemoteClient } from '../../base';

export type CreateCommonObjectRecordResponse<T extends EngagementCommonObjectType> = {
  id: string;
  record?: EngagementCommonObjectTypeMap<T>['object'];
};

export type UpdateCommonObjectRecordResponse<T extends EngagementCommonObjectType> =
  CreateCommonObjectRecordResponse<T>;

export interface EngagementRemoteClient extends RemoteClient {
  listCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable>;
  getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']>;
  createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<CreateCommonObjectRecordResponse<T>>;
  updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<UpdateCommonObjectRecordResponse<T>>;
}

export abstract class AbstractEngagementRemoteClient extends AbstractRemoteClient implements EngagementRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public handleErr(err: unknown): unknown {
    return err;
  }

  public async listCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date,
    heartbeat?: () => void
  ): Promise<Readable> {
    throw new Error('Not implemented');
  }
  public async getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }
  public async createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<CreateCommonObjectRecordResponse<T>> {
    throw new Error('Not implemented');
  }
  public async updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<UpdateCommonObjectRecordResponse<T>> {
    throw new Error('Not implemented');
  }
}
