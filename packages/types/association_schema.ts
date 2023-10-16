export type AssociationCardinality = 'ONE_TO_MANY';

export type AssociationCardinalityOrUnknown = AssociationCardinality | 'UNKNOWN';

export type AssociationSchema = {
  id: string;
  sourceObject: string;
  targetObject: string;
  displayName: string;
  cardinality: AssociationCardinalityOrUnknown;
};

export type AssociationSchemaCreateParams = {
  sourceObject: string;
  targetObject: string;
  keyName: string;
  displayName: string;
  cardinality: AssociationCardinality;
};

export type SimpleAssociationSchema = {
  id: string;
  displayName: string;
  cardinality: AssociationCardinalityOrUnknown;
};
