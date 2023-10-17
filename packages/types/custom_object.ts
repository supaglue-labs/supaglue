import type { PropertyUnified } from './property';

export type SimpleCustomObject = {
  id: string;
  name: string;
};

export type CustomObject = {
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

export type CustomObjectCreateParams = CustomObject;
export type CustomObjectUpdateParams = CustomObject;

export type CustomObjectField = {
  displayName: string;
  keyName: string;
  isRequired: boolean;
  fieldType: CustomObjectFieldType;
};

export type CustomObjectFieldType = 'string' | 'number';
