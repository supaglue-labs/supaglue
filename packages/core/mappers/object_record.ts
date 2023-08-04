import type { CustomObjectRecord, StandardObjectRecord } from '@supaglue/types';

export function toSnakecaseKeysStandardObjectRecord(record: StandardObjectRecord) {
  const { additionalFields, ...rest } = record.data;
  return {
    id: record.id,
    standard_object_name: record.standardObjectName,
    data: {
      additional_fields: additionalFields,
      ...rest,
    },
  };
}

export function toSnakecaseKeysCustomObjectRecord(record: CustomObjectRecord) {
  const { additionalFields, ...rest } = record.data;
  return {
    id: record.id,
    custom_object_id: record.customObjectId,
    data: {
      additional_fields: additionalFields,
      ...rest,
    },
  };
}
