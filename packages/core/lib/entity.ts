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
  const coreFieldMappings = fieldMappings?.filter((field) =>
    config.fields.find((entityField) => entityField.name === field.entityField)
  );
  const additionalFieldMappings = fieldMappings?.filter(
    (field) => !config.fields.find((entityField) => entityField.name === field.entityField)
  );
  if (!config.allowAdditionalFieldMappings && additionalFieldMappings?.length) {
    throw new Error('Additional field mappings are not allowed');
  }

  return {
    type: 'defined',
    coreFieldMappings:
      coreFieldMappings?.map(({ entityField, mappedField }) => ({
        schemaField: entityField,
        mappedField,
      })) ?? [],
    additionalFieldMappings:
      additionalFieldMappings?.map(({ entityField, mappedField }) => ({
        schemaField: entityField,
        mappedField,
      })) ?? [],
  };
}

export function validateEntityOrSchemaFieldName(name: string): void {
  if (name.startsWith('_supaglue') || name === 'id' || name === 'additional_fields') {
    throw new Error(`Invalid field name: ${name}; this is a reserved field name.`);
  }
}
