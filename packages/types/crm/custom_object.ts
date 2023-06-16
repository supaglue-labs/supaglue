type BaseCustomObject = {
  name: string;
  description: string | null;
  labels: {
    singular: string;
    plural: string;
  };
  fields: CustomObjectField[];
  // TODO: timestamps?
};

export type CustomObject = BaseCustomObject & {
  id: string;
};
export type CustomObjectCreateParams = BaseCustomObject;
export type CustomObjectUpdateParams = CustomObject;

export type CustomObjectField = {
  displayName: string;
  keyName: string;
  isRequired: boolean;
  fieldType: CustomObjectFieldType;
};

export type CustomObjectFieldType = 'string' | 'number';
