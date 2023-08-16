import type { StandardObjectRecord } from '@supaglue/types';

export function toSnakecaseKeysStandardObjectRecord(record: StandardObjectRecord) {
  const { additionalFields: additionalFields, ...rest } = record.data;
  return {
    id: record.id,
    standard_object_name: record.standardObjectName,
    data: {
      additional_fields: additionalFields,
      ...rest,
    },
  };
}
