import type { ObjectRecordUpsertData } from './object_record';

export type SimpleEntity = {
  id: string;
  name: string;
};

export type CreatedEntityRecord = {
  id: string;
  entity: SimpleEntity;
};

export type EntityRecordUpsertData = ObjectRecordUpsertData;

export type EntityRecordData = {
  additionalFields?: Record<string, unknown>;
  [key: string]: unknown;
};

export type EntityRecord = {
  id: string;
  entity: SimpleEntity;
  data: EntityRecordData;
};
