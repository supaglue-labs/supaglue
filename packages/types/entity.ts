export type Entity = {
  id: string;
  applicationId: string;
  name: string;
  config: EntityConfig;
};

export type EntityConfig = {
  fields: EntityField[];
  allowAdditionalFieldMappings: boolean;
};

export type EntityField = {
  name: string; // my_first_column
};

export type EntityCreateParams = Omit<Entity, 'id'>;
export type EntityUpdateParams = Omit<EntityCreateParams, 'applicationId'>;
