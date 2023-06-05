import type {
  CommonModelType,
  CommonModelTypeForCategory,
  CommonModelTypeMapForCategory,
  ConnectionSafeAny,
  IntegrationCategory,
} from '@supaglue/types';
import type { Readable } from 'stream';

export type WriteCommonModelsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export interface DestinationWriter {
  upsertObject<P extends IntegrationCategory, T extends CommonModelTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonModelType: T,
    object: CommonModelTypeMapForCategory<P>['object']
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
  abstract upsertObject<P extends IntegrationCategory, T extends CommonModelTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonModelType: T,
    object: CommonModelTypeMapForCategory<P>['object']
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
