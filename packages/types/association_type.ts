export type AssociationTypeCardinality = 'ONE_TO_MANY';

export type AssociationTypeCardinalityOrUnknown = AssociationTypeCardinality | 'UNKNOWN';

export type AssociationType = {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  displayName: string;
  cardinality: AssociationTypeCardinalityOrUnknown;
};

export type AssociationTypeCreateParams = {
  sourceEntityId: string;
  targetEntityId: string;
  keyName: string;
  displayName: string;
  cardinality: AssociationTypeCardinality;
};

export type SimpleAssociationType = {
  id: string;
  displayName: string;
  cardinality: AssociationTypeCardinalityOrUnknown;
};
