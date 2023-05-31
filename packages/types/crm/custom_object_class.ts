type BaseCustomObjectClass = {
  name: string;
  description: string | null;
  labels: {
    singular: string;
    plural: string;
  };
  fields: CustomObjectFieldClass[];
  // TODO: timestamps?
};

export type CustomObjectClass = BaseCustomObjectClass & {
  id: string;
};
export type CustomObjectClassCreateParams = BaseCustomObjectClass;
export type CustomObjectClassUpdateParams = CustomObjectClass;

export type CustomObjectFieldClass = {
  displayName: string;
  remoteKeyName: string;
  isRequired: boolean;
  fieldType: CustomObjectFieldType;
};

export type CustomObjectFieldType = 'string' | 'number' | 'date' | 'datetime' | 'bool';
