export type InheritedFieldsToFetch = {
  type: 'inherit_all_fields';
};

export type DefinedFieldsToFetch = {
  type: 'defined';
  fields: string[];
};

export type FieldsToFetch = InheritedFieldsToFetch | DefinedFieldsToFetch;
