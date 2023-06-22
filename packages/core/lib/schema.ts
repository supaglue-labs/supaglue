import { RawObjectSchema, RawObjectSchemaField, SchemaMappingsConfigStandardObjectFieldMapping } from '@supaglue/types';
import { FieldMappingConfig } from '@supaglue/types/field_mapping_config';

export function createFieldMappingConfig(
  schema?: RawObjectSchema,
  customerFieldMappings?: SchemaMappingsConfigStandardObjectFieldMapping[]
): FieldMappingConfig {
  if (!schema || schema.type === 'inherit_all_fields') {
    return { type: 'inherit_all_fields' };
  }

  const unmappedSchemaFields: RawObjectSchemaField[] = [];
  const mappedSchemaFields: { name: string; mappedName: string }[] = [];

  for (const field of schema.fields) {
    if (field.mappedName) {
      mappedSchemaFields.push({ name: field.name, mappedName: field.mappedName });
    } else {
      unmappedSchemaFields.push(field);
    }
  }

  // Check that all fields in schema have a mapped field
  for (const unmappedSchemaField of unmappedSchemaFields) {
    const mappedField = customerFieldMappings?.find((field) => field.schemaField === unmappedSchemaField.name);
    if (!mappedField) {
      throw new Error(`No mapped field found for schema field ${unmappedSchemaField.name}`);
    }
  }

  // Iterate over customer field mappings. Any fields that are not in the schema are only
  // allowed if allowAdditionalFieldMappings is true.
  for (const customerFieldMapping of customerFieldMappings ?? []) {
    const correspondingSchemaField = schema.fields.find((field) => field.name === customerFieldMapping.schemaField);
    if (correspondingSchemaField) {
      // Don't allow setting of fields that are already set in the schema
      if (correspondingSchemaField.mappedName) {
        throw new Error(`Field ${correspondingSchemaField.name} is already mapped`);
      }
    } else {
      // If the field is not in the schema, it's only allowed if allowAdditionalFieldMappings is true
      if (!schema.allowAdditionalFieldMappings) {
        throw new Error(`Field ${customerFieldMapping.schemaField} is not in the schema`);
      }
    }
  }
  if (
    !schema.allowAdditionalFieldMappings &&
    customerFieldMappings?.some(
      (field) => !unmappedSchemaFields.find((schemaField) => schemaField.name === field.schemaField)
    )
  ) {
    throw new Error('Additional field mappings are not allowed');
  }

  // Combine:
  // 1. already-mapped schema fields
  // 2. customer field mappings
  return {
    type: 'defined',
    fieldMappings: [
      ...mappedSchemaFields.map((field) => ({
        schemaField: field.name,
        mappedField: field.mappedName,
      })),
      ...(customerFieldMappings ?? []),
    ],
  };
}
