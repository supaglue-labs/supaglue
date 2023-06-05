export type ObjectClass = {
  id: string;
  originType: 'CUSTOM_OBJECT' | 'COMMON_MODEL';
};

export type AssociationTypeCardinality = 'ONE_TO_MANY';

export type AssociationTypeCardinalityOrUnknown = AssociationTypeCardinality | 'UNKNOWN';

export type AssociationType = {
  id: string;
  sourceObjectClass: ObjectClass;
  targetObjectClass: ObjectClass;
  displayName: string;
  cardinality: AssociationTypeCardinalityOrUnknown;
};

export type AssociationTypeCreateParams = {
  sourceObjectClass: ObjectClass;
  targetObjectClass: ObjectClass;
  keyName: string;
  displayName: string;
  cardinality: AssociationTypeCardinality;
};
