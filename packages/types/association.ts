type BaseAssociation = {
  sourceRecord: AssociatedRecord;
  targetRecord: AssociatedRecord;
  associationSchemaId: string;
};

export type Association = BaseAssociation;
export type AssociationCreateParams = BaseAssociation;

type BaseObjectAssociation = {
  sourceRecord: AssociatedObjectRecord;
  targetRecord: AssociatedObjectRecord;
  associationSchemaId: string;
};

export type ObjectAssociation = BaseObjectAssociation;
export type ObjectAssociationCreateParams = BaseObjectAssociation;

export type ListAssociationsParams = {
  sourceRecord: AssociatedObjectRecord;
  targetEntityId: string;
};

export type ListObjectAssociationsParams = {
  sourceRecord: AssociatedObjectRecord;
  targetObject: string;
};

type AssociatedObjectRecord = {
  id: string;
  objectName: string;
};

type AssociatedRecord = {
  id: string;
  entityId: string;
};
