export type FormField = {
  id: string;
  name: string;
  required: boolean;
  formId: string;
  dataFormat: string;
  // Only applicable if the dataFormat is `select`
  dataOptions?: FormFieldDataOption[];
  validationMessage?: string;
  rawData?: Record<string, unknown>;
};

export type FormFieldDataOption = {
  label: string;
  value: string;
  rawData?: Record<string, unknown>;
};
