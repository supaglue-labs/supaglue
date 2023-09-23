import type { StandardObject, StandardOrCustomObject } from './standard_or_custom_object';

/**
 * @deprecated
 */
export type MergedEntityMappingWithoutAttribution = {
  entityId: string;
  object?: StandardOrCustomObject;
  fieldMappings: EntityFieldMapping[];
};

/**
 * @deprecated
 */
export type MergedEntityMapping = {
  entityId: string;
  entityName: string;
  allowAdditionalFieldMappings: boolean;
  object?: StandardOrCustomObject & {
    from: 'developer' | 'customer';
  };
  fieldMappings: MergedEntityFieldMapping[];
};

/**
 * @deprecated
 */
export type MergedEntityFieldMapping = {
  entityField: string;
  mappedField?: string;
  from?: 'developer' | 'customer';
  isAdditional: boolean;
};

/**
 * @deprecated
 */
export type ProviderEntityMapping = {
  entityId: string;
  // don't support custom objects because for hubspot, custom object id is different per customer
  object?: StandardObject;
  fieldMappings?: EntityFieldMapping[];
};

/**
 * @deprecated
 */
export type ConnectionEntityMapping = {
  entityId: string;
  object?: StandardOrCustomObject;
  fieldMappings?: EntityFieldMapping[];
};

/**
 * @deprecated
 */
export type EntityFieldMapping = {
  entityField: string;
  mappedField: string;
};
