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
  primaryFieldKeyName: string;
  fields: CustomObjectField[];
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
