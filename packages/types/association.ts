type BaseAssociation = {
  sourceRecord: AssociatedObjectRecord;
  targetRecord: AssociatedObjectRecord;
  associationSchemaId: string;
};

export type Association = BaseAssociation;
export type AssociationCreateParams = BaseAssociation;

export type ListAssociationsParams = {
  sourceRecord: AssociatedObjectRecord;
  targetObject: string;
};

type AssociatedObjectRecord = {
  id: string;
  objectName: string;
};
