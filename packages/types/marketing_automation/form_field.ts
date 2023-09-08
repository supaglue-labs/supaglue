export type FormField = {
  id: string;
  name: string;
  required: boolean;
  formId: string;
  dataFormat: string;
  validationMessage?: string;
  rawData?: Record<string, unknown>;
};
