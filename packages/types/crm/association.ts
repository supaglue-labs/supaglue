import { ObjectClass } from './association_type';

type BaseAssociation = {
  sourceObject: AssociatedObject;
  targetObject: AssociatedObject;
  associationTypeId: string;
};

export type Association = BaseAssociation;
export type AssociationCreateParams = BaseAssociation;

type AssociatedObject = {
  id: string;
  objectClass: ObjectClass;
};
