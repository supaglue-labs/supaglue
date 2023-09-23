/**
 * @deprecated
 */
export type FieldMappingInfo = {
  name: string;
  isAddedByCustomer: boolean;
  customerMappedName?: string;
  schemaMappedName?: string;
};

/**
 * @deprecated
 */
export type ObjectFieldMappingInfo = {
  objectName: string;
  objectType: 'common' | 'standard';
  schemaId: string;
  allowAdditionalFieldMappings: boolean;
  fields: FieldMappingInfo[];
};

/**
 * @deprecated
 */
export type ObjectFieldMappingUpdateParams = {
  name: string;
  type: 'common' | 'standard';
  fieldMappings: SchemaMappingsConfigObjectFieldMapping[];
};

/**
 * @deprecated
 */
export type SchemaMappingsConfig = {
  // TODO: Support custom objects.
  commonObjects?: SchemaMappingsConfigForObject[];
  standardObjects?: SchemaMappingsConfigForObject[];
};

/**
 * @deprecated
 */
export type SchemaMappingsConfigForObject = {
  object: string;
  fieldMappings: SchemaMappingsConfigObjectFieldMapping[];
};

/**
 * @deprecated
 */
export type SchemaMappingsConfigObjectFieldMapping = {
  schemaField: string; // my_first_column
  mappedField?: string; // blah_1
};
