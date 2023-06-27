export type Schema = {
  id: string;
  applicationId: string;
  name: string;
  config: SchemaConfig;
};

export type SchemaConfig = {
  fields: SchemaField[];
  allowAdditionalFieldMappings: boolean;
};

export type SchemaField = {
  name: string; // my_first_column
  mappedName?: string; // salesforce_first_column
};

export type SchemaCreateParams = Omit<Schema, 'id'>;
export type SchemaUpdateParams = Omit<SchemaCreateParams, 'applicationId'>;
