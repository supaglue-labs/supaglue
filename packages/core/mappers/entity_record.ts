import type { EntityRecord } from '@supaglue/types/entity_record';

export function toSnakecaseKeysEntityRecord(record: EntityRecord) {
  const { additionalFields, ...rest } = record.data;
  return {
    id: record.id,
    entity: record.entity,
    data: {
      additional_fields: additionalFields,
      ...rest,
    },
  };
}
