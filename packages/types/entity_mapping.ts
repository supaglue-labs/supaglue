import type { StandardObject, StandardOrCustomObject } from './standard_or_custom_object';

export type MergedEntityMappingWithoutAttribution = {
  entityId: string;
  object?: StandardOrCustomObject;
  fieldMappings: EntityFieldMapping[];
};

export type MergedEntityMapping = {
  entityId: string;
  entityName: string;
  allowAdditionalFieldMappings: boolean;
  object?: StandardOrCustomObject & {
    from: 'developer' | 'customer';
  };
  fieldMappings: MergedEntityFieldMapping[];
};

export type MergedEntityFieldMapping = {
  entityField: string;
  mappedField?: string;
  from?: 'developer' | 'customer';
  isAdditional: boolean;
};

export type ProviderEntityMapping = {
  entityId: string;
  // don't support custom objects because for hubspot, custom object id is different per customer
  object?: StandardObject;
  fieldMappings?: EntityFieldMapping[];
};

export type ConnectionEntityMapping = {
  entityId: string;
  object?: StandardOrCustomObject;
  fieldMappings?: EntityFieldMapping[];
};

export type EntityFieldMapping = {
  entityField: string;
  mappedField: string;
};
