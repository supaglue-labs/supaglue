export type Entity = {
  id: string;
  applicationId: string;
  // IMPORTANT: we use this in URLs for entity actions, so it is critical that this
  // is comprised of only letters, numbers, underscores, and dashes.
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
