type BaseCustomObjectRecord = {
  objectId: string;
  fields: Record<string, string | number | boolean | Date>;
};

export type CustomObjectRecord = BaseCustomObjectRecord & {
  id: string;
};
export type CustomObjectRecordCreateParams = BaseCustomObjectRecord;
export type CustomObjectRecordUpdateParams = CustomObjectRecord;
