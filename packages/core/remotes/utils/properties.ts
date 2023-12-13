import type { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import type { PropertiesWithAdditionalFields } from '@supaglue/types/object_record';

export function toMappedProperties(
  properties: Record<string, any>,
  fieldMappingConfig: FieldMappingConfig
): PropertiesWithAdditionalFields {
  if (fieldMappingConfig.type === 'inherit_all_fields') {
    return properties;
  }

  return {
    ...Object.fromEntries(
      fieldMappingConfig.coreFieldMappings.map(({ schemaField, mappedField }) => [schemaField, properties[mappedField]])
    ),
    additionalFields: Object.fromEntries(
      fieldMappingConfig.additionalFieldMappings.map(({ schemaField, mappedField }) => [
        schemaField,
        properties[mappedField],
      ])
    ),
  };
}
