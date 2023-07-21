import type {
  CommonObjectType,
  CommonObjectTypeForCategory,
  CommonObjectTypeMapForCategory,
  ConnectionSafeAny,
  ProviderCategory,
} from '@supaglue/types';
import type { Readable } from 'stream';

export type WriteCommonObjectRecordsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export type WriteObjectRecordsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export type WriteEntityRecordsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export interface DestinationWriter {
  upsertCommonObjectRecord<P extends ProviderCategory, T extends CommonObjectTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonObjectType: T,
    record: CommonObjectTypeMapForCategory<P>['object']
  ): Promise<void>;

  writeCommonObjectRecords(
    connection: ConnectionSafeAny,
    commonObjectType: CommonObjectType,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonObjectRecordsResult>;

  writeObjectRecords(
    connection: ConnectionSafeAny,
    object: string,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteObjectRecordsResult>;

  writeEntityRecords(
    connection: ConnectionSafeAny,
    entityName: string,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteEntityRecordsResult>;
}

export abstract class BaseDestinationWriter implements DestinationWriter {
  /**
   * This is a method used for writers that support updating objects after
   * syncing, e.g. Postgres for "cache invalidation"
   *
   * TODO: Support engagement vertical as well
   */
  abstract upsertCommonObjectRecord<P extends ProviderCategory, T extends CommonObjectTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonObjectType: T,
    record: CommonObjectTypeMapForCategory<P>['object']
  ): Promise<void>;

  /**
   * This is the main method used to sync objects to a destination
   */
  abstract writeCommonObjectRecords(
    connection: ConnectionSafeAny,
    commonObjectType: CommonObjectType,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonObjectRecordsResult>;

  abstract writeObjectRecords(
    connection: ConnectionSafeAny,
    object: string,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteObjectRecordsResult>;

  abstract writeEntityRecords(
    connection: ConnectionSafeAny,
    entityName: string,
    stream: Readable,
    heartbeat: () => void
  ): Promise<WriteEntityRecordsResult>;
}
