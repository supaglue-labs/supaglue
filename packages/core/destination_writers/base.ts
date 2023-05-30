import type { CommonModelType, ConnectionSafeAny } from '@supaglue/types';
import { CRMCommonModelType, CRMCommonModelTypeMap } from '@supaglue/types/crm';
import type { Readable } from 'stream';

export type WriteCommonModelsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export interface DestinationWriter {
  upsertObject<T extends CRMCommonModelType>(
    connection: ConnectionSafeAny,
    commonModelType: T,
    object: CRMCommonModelTypeMap<T>['object']
  ): Promise<void>;

  writeObjects(
    connection: ConnectionSafeAny,
    commonModelType: CommonModelType,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelsResult>;
}

export abstract class BaseDestinationWriter implements DestinationWriter {
  /**
   * This is a method used for writers that support updating objects after
   * syncing, e.g. Postgres for "cache invalidation"
   *
   * TODO: Support engagement vertical as well
   */
  abstract upsertObject<T extends CRMCommonModelType>(
    connection: ConnectionSafeAny,
    commonModelType: T,
    object: CRMCommonModelTypeMap<T>['object']
  ): Promise<void>;

  /**
   * This is the main method used to sync objects to a destination
   */
  abstract writeObjects(
    connection: ConnectionSafeAny,
    commonModelType: CommonModelType,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelsResult>;
}
