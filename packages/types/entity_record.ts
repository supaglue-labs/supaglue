import type { BaseFullRecord, ObjectRecordUpsertData, PropertiesWithAdditionalFields } from './object_record';

export type SimpleEntity = {
  id: string;
  name: string;
};

export type CreatedEntityRecord = {
  id: string;
  entity: SimpleEntity;
};

export type EntityRecordUpsertData = ObjectRecordUpsertData;

export type EntityRecordData = PropertiesWithAdditionalFields;

export type EntityRecord = {
  id: string;
  entity: SimpleEntity;
  data: EntityRecordData;
};

export type FullEntityRecord = BaseFullRecord & {
  entity: SimpleEntity;
};
