import type { StandardOrCustomObject } from './standard_or_custom_object';

type From = {
  from: 'developer' | 'customer';
};

export type MergedEntityMapping = {
  entityId: string;
  object?: StandardOrCustomObject & From;
  fieldMappings?: (EntityFieldMapping & From)[];
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
