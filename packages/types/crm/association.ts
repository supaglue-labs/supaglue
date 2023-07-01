import type { SGObject } from './association_type';

type BaseAssociation = {
  sourceRecord: AssociatedRecord;
  targetRecord: AssociatedRecord;
  associationTypeId: string;
};

export type Association = BaseAssociation;
export type AssociationCreateParams = BaseAssociation;

type AssociatedRecord = {
  id: string;
  object: SGObject;
};
