import type { Entity } from '@supaglue/types/entity';
import type { EntityFieldMapping } from '@supaglue/types/entity_mapping';
import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';

export function createFieldMappingConfigForEntity(
  entity: Entity,
  fieldMappings?: EntityFieldMapping[]
): FieldMappingConfig {
  const { config } = entity;

  // If there are any unmapped schema fields, let's treat it as optional for now.
  // Later, we will want to allow the developer to specify 'isRequired' for a field, and we should
  // throw an error on that.

  // If there are any extra fields mapped, throw an error unless allowAdditionalFieldMappings is true
  const additionalFieldMappings = fieldMappings?.filter(
    (field) => !config.fields.find((entityField) => entityField.name === field.entityField)
  );
  if (!config.allowAdditionalFieldMappings && additionalFieldMappings?.length) {
    throw new Error('Additional field mappings are not allowed');
  }

  return {
    type: 'defined',
    fieldMappings:
      fieldMappings?.map(({ entityField, mappedField }) => ({
        schemaField: entityField,
        mappedField,
      })) ?? [],
  };
}
