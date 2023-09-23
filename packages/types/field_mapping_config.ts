/**
 * @deprecated
 */
export type FieldMapping = {
  schemaField: string;
  mappedField: string;
};

/**
 * @deprecated
 */
export type InheritedFieldMappingConfig = {
  type: 'inherit_all_fields';
};

/**
 * @deprecated
 */
export type DefinedFieldMappingConfig = {
  type: 'defined';
  coreFieldMappings: FieldMapping[];
  additionalFieldMappings: FieldMapping[];
};

/**
 * @deprecated
 */
export type FieldMappingConfig = InheritedFieldMappingConfig | DefinedFieldMappingConfig;
