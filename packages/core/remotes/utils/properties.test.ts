import { describe, expect, test } from '@jest/globals';
import type { DefinedFieldMappingConfig, InheritedFieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { toMappedProperties } from './properties';

describe('toMappedProperties', () => {
  test('returns properties as-is for inherit_all_fields configuration', () => {
    const properties: Record<string, any> = {
      someProperty: 'someValue',
      anotherProperty: 1234,
      yetAnotherProperty: true,
    };

    const config: InheritedFieldMappingConfig = {
      type: 'inherit_all_fields',
    };

    const result = toMappedProperties(properties, config);

    expect(result).toEqual(properties);
  });

  test('maps properties based on core and additional field mappings for defined configuration', () => {
    const properties: Record<string, any> = {
      prop1: 'value1',
      prop2: 'value2',
      prop3: 'value3',
      prop4: 'value4',
    };

    const config: DefinedFieldMappingConfig = {
      type: 'defined',
      coreFieldMappings: [
        { schemaField: 'schemaField1', mappedField: 'prop1' },
        { schemaField: 'schemaField2', mappedField: 'prop2' },
      ],
      additionalFieldMappings: [
        { schemaField: 'additionalSchemaField1', mappedField: 'prop3' },
        { schemaField: 'additionalSchemaField2', mappedField: 'prop4' },
      ],
    };

    const result = toMappedProperties(properties, config);

    expect(result).toEqual({
      schemaField1: 'value1',
      schemaField2: 'value2',
      additionalFields: {
        additionalSchemaField1: 'value3',
        additionalSchemaField2: 'value4',
      },
    });
  });

  test('handles missing properties gracefully', () => {
    const properties: Record<string, any> = {
      prop1: 'value1',
      prop3: 'value3',
    };

    const config: DefinedFieldMappingConfig = {
      type: 'defined',
      coreFieldMappings: [
        { schemaField: 'schemaField1', mappedField: 'prop1' },
        { schemaField: 'schemaField2', mappedField: 'prop2' },
      ],
      additionalFieldMappings: [
        { schemaField: 'additionalSchemaField1', mappedField: 'prop3' },
        { schemaField: 'additionalSchemaField2', mappedField: 'prop4' },
      ],
    };

    const result = toMappedProperties(properties, config);

    expect(result).toEqual({
      schemaField1: 'value1',
      schemaField2: undefined,
      additionalFields: {
        additionalSchemaField1: 'value3',
        additionalSchemaField2: undefined,
      },
    });
  });
});
