import type { BaseFullRecord, ObjectRecordUpsertData, PropertiesWithAdditionalFields } from './object_record';

/**
 * @deprecated
 */
export type SimpleEntity = {
  id: string;
  name: string;
};

/**
 * @deprecated
 */
export type CreatedEntityRecord = {
  id: string;
  entity: SimpleEntity;
};

/**
 * @deprecated
 */
export type EntityRecordUpsertData = ObjectRecordUpsertData;

/**
 * @deprecated
 */
export type EntityRecordData = PropertiesWithAdditionalFields;

/**
 * @deprecated
 */
export type EntityRecord = {
  id: string;
  entity: SimpleEntity;
  data: EntityRecordData;
};

/**
 * @deprecated
 */
export type FullEntityRecord = BaseFullRecord & {
  entity: SimpleEntity;
};
