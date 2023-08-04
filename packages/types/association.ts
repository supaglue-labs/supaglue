type BaseAssociation = {
  sourceRecord: AssociatedRecord;
  targetRecord: AssociatedRecord;
  associationTypeId: string;
};

export type Association = BaseAssociation;
export type AssociationCreateParams = BaseAssociation;

type BaseObjectAssociation = {
  sourceRecord: AssociatedObjectRecord;
  targetRecord: AssociatedObjectRecord;
  associationTypeId: string;
};

export type ObjectAssociation = BaseObjectAssociation;
export type ObjectAssociationCreateParams = BaseObjectAssociation;

export type ListAssociationsParams = {
  sourceRecord: AssociatedRecord;
  targetEntityId: string;
};

export type ListObjectAssociationsParams = {
  sourceRecord: AssociatedObjectRecord;
  targetObject: StandardOrCustomObject;
};

type AssociatedObjectRecord = {
  id: string;
  object: StandardOrCustomObject;
};

type StandardOrCustomObject =
  | {
      type: 'standard';
      name: string;
    }
  | {
      type: 'custom';
      id: string;
    };

type AssociatedRecord = {
  id: string;
  entityId: string;
};
