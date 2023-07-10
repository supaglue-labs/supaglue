import type { ObjectType } from './object_sync';

export type FieldMappingInfo = {
  name: string;
  isAddedByCustomer: boolean;
  customerMappedName?: string;
  schemaMappedName?: string;
};

export type ObjectFieldMappingInfo = {
  objectName: string;
  objectType: ObjectType;
  schemaId: string;
  allowAdditionalFieldMappings: boolean;
  fields: FieldMappingInfo[];
};
