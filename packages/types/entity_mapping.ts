import type { FieldMapping } from './field_mapping_config';

export type EntityMapping = {
  entityId: string;
  object: {
    type: 'standard' | 'custom';
    name: string;
  };
  fieldMappings: FieldMapping[];
};
