import type { StandardOrCustomObject } from './standard_or_custom_object';

export type MergedEntityMapping = {
  entityId: string;
  entityName: string;
  object?: StandardOrCustomObject & {
    from: 'developer' | 'customer';
  };
  fieldMappings: MergedEntityFieldMapping[];
};

export type MergedEntityFieldMapping = {
  entityField: string;
  mappedField?: string;
  from?: 'developer' | 'customer';
};

export type EntityMapping = {
  entityId: string;
  object?: StandardOrCustomObject;
  fieldMappings?: EntityFieldMapping[];
};

export type EntityFieldMapping = {
  entityField: string;
  mappedField: string;
};
