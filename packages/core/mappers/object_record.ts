import type { ObjectRecord } from '@supaglue/types';

export function toSnakecaseKeysObjectRecord(record: ObjectRecord) {
  const { additionalFields: additionalFields, ...rest } = record.data;
  return {
    id: record.id,
    standard_object_name: record.objectName,
    data: {
      additional_fields: additionalFields,
      ...rest,
    },
  };
}
