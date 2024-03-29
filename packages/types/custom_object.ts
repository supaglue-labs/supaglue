import type { PropertyUnified } from './property';

export type SimpleCustomObjectSchemaDeprecated = {
  id: string;
  name: string;
};

export type SimpleCustomObjectSchema = {
  name: string;
  labels: {
    singular: string;
    plural: string;
  };
};

export type CustomObjectSchema = {
  name: string;
  description: string | null;
  labels: {
    singular: string;
    plural: string;
  };
  primaryFieldId: string;
  fields: PropertyUnified[];
  // TODO: timestamps?
};

export type CustomObjectSchemaCreateParams = CustomObjectSchema;
export type CustomObjectSchemaUpdateParams = CustomObjectSchema;

export type CustomObjectField = {
  displayName: string;
  keyName: string;
  isRequired: boolean;
  fieldType: CustomObjectFieldType;
};

export type CustomObjectFieldType = 'string' | 'number';
