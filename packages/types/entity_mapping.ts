import type { FieldMapping } from './field_mapping_config';
import type { StandardOrCustomObject } from './standard_or_custom_object';

export type EntityMapping = {
  entityId: string;
  object: StandardOrCustomObject;
  fieldMappings: FieldMapping[];
};
