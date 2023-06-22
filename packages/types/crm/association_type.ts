/**
 * Not calling this `Object` because it is a reserved word in JS
 */
export type SGObject = {
  id: string;
  originType: 'CUSTOM_OBJECT' | 'COMMON_OBJECT';
};

export type AssociationTypeCardinality = 'ONE_TO_MANY';

export type AssociationTypeCardinalityOrUnknown = AssociationTypeCardinality | 'UNKNOWN';

export type AssociationType = {
  id: string;
  sourceObject: SGObject;
  targetObject: SGObject;
  displayName: string;
  cardinality: AssociationTypeCardinalityOrUnknown;
};

export type AssociationTypeCreateParams = {
  sourceObject: SGObject;
  targetObject: SGObject;
  keyName: string;
  displayName: string;
  cardinality: AssociationTypeCardinality;
};
