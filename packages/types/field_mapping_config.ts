export type FieldMapping = {
  schemaField: string;
  mappedField: string;
};

export type InheritedFieldMappingConfig = {
  type: 'inherit_all_fields';
};

export type DefinedFieldMappingConfig = {
  type: 'defined';
  coreFieldMappings: FieldMapping[];
  additionalFieldMappings: FieldMapping[];
};

export type FieldMappingConfig = InheritedFieldMappingConfig | DefinedFieldMappingConfig;
