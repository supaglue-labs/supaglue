// Deprecated
export type Property = {
  id: string;
  label: string;

  // this is passed back directly from the provider
  // we do not have our own enum mapping here
  type?: string;
  rawDetails?: Record<string, unknown>;
};

export type PropertyType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'picklist'
  | 'multipicklist'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'other';

export type PicklistOption = {
  label: string;
  value: string;
  description?: string;
  hidden?: boolean;
};

export type PropertyUnified = {
  id: string;
  customName?: string;
  label: string;
  description?: string;
  isRequired?: boolean;
  defaultValue?: string | number | boolean;
  groupName?: string;
  type: PropertyType;
  precision?: number;
  scale?: number;
  options?: PicklistOption[];
  rawDetails?: Record<string, unknown>;
};
