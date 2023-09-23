/**
 * @deprecated
 */
export type Entity = {
  id: string;
  applicationId: string;
  // IMPORTANT: we use this in URLs for entity actions, so it is critical that this
  // is comprised of only letters, numbers, and underscores.
  name: string;
  config: EntityConfig;
};

/**
 * @deprecated
 */
export type EntityConfig = {
  fields: EntityField[];
  allowAdditionalFieldMappings: boolean;
};

/**
 * @deprecated
 */
export type EntityField = {
  name: string; // my_first_column
};

/**
 * @deprecated
 */
export type EntityCreateParams = Omit<Entity, 'id'>;

/**
 * @deprecated
 */
export type EntityUpdateParams = Omit<EntityCreateParams, 'applicationId'>;
