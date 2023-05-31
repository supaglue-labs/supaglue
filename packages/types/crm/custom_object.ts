type BaseCustomObject = {
  classId: string;
  fields: Record<string, string | number | boolean | Date>;
};

export type CustomObject = BaseCustomObject & {
  id: string;
};
export type CustomObjectCreateParams = BaseCustomObject;
export type CustomObjectUpdateParams = CustomObject;
