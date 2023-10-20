import type {
  CommonObjectType,
  CommonObjectTypeForCategory,
  CommonObjectTypeMapForCategory,
  ConnectionSafeAny,
  FullObjectRecord,
  PropertiesWithAdditionalFields,
  ProviderCategory,
  TransformedPropertiesWithAdditionalFields,
} from '@supaglue/types';
import type { FullEntityRecord } from '@supaglue/types/entity_record';
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
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteCommonObjectRecordsResult>;

  /**
   *
   * @param connection
   * @param object
   * @param stream this streams objects of type ObjectRecord<T>
   * @param heartbeat
   */
  writeObjectRecords(
    connection: ConnectionSafeAny,
    object: string,
    stream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteObjectRecordsResult>;

  /**
   *
   * @param connection
   * @param objectName
   * @param record
   */
  upsertStandardObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    record: FullObjectRecord
  ): Promise<void>;

  /**
   *
   * @param connection
   * @param objectName
   * @param record
   */
  upsertCustomObjectRecord(connection: ConnectionSafeAny, objectName: string, record: FullObjectRecord): Promise<void>;

  /**
   *
   * @param connection
   * @param entityName
   * @param stream this streams objects of type ObjectRecord<T>
   * @param heartbeat
   */
  writeEntityRecords(
    connection: ConnectionSafeAny,
    entityName: string,
    stream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteEntityRecordsResult>;

  /**
   *
   * @param connection
   * @param objectName
   * @param record
   */
  upsertEntityRecord(connection: ConnectionSafeAny, entityName: string, record: FullEntityRecord): Promise<void>;
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

  abstract upsertStandardObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    record: FullObjectRecord
  ): Promise<void>;

  abstract upsertCustomObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    record: FullObjectRecord
  ): Promise<void>;

  abstract upsertEntityRecord(
    connection: ConnectionSafeAny,
    entityName: string,
    record: FullEntityRecord
  ): Promise<void>;

  /**
   * This is the main method used to sync objects to a destination
   */
  abstract writeCommonObjectRecords(
    connection: ConnectionSafeAny,
    commonObjectType: CommonObjectType,
    stream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteCommonObjectRecordsResult>;

  abstract writeObjectRecords(
    connection: ConnectionSafeAny,
    object: string,
    stream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteObjectRecordsResult>;

  abstract writeEntityRecords(
    connection: ConnectionSafeAny,
    entityName: string,
    stream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteEntityRecordsResult>;
}

export function toTransformedPropertiesWithAdditionalFields(
  properties: PropertiesWithAdditionalFields
): TransformedPropertiesWithAdditionalFields {
  const { additionalFields, ...rest } = properties;
  return {
    ...rest,
    _supaglue_additional_fields: additionalFields,
  };
}
