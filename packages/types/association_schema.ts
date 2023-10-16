export type AssociationSchema = {
  id: string;
  sourceObject: string;
  targetObject: string;
  displayName: string;
};

export type AssociationSchemaCreateParams = {
  sourceObject: string;
  targetObject: string;
  keyName: string;
  displayName: string;
};

export type SimpleAssociationSchema = {
  id: string;
  displayName: string;
};
