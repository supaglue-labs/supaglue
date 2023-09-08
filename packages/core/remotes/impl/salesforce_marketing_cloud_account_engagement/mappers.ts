import type { FormField } from '@supaglue/types/marketing_automation/form_field';
import type { FormMetadata } from '@supaglue/types/marketing_automation/form_metadata';
import type { PardotFormHandler, PardotFormHandlerField } from '.';

export const fromPardotFormHandlerToFormMetadata = (record: PardotFormHandler): FormMetadata => {
  return {
    id: record.id.toString(),
    name: record.name,
    createdAt: new Date(record.createdAt),
    updatedAt: new Date(record.updatedAt),
    rawData: record,
  };
};

export const fromPardotFormHandlerFieldToFormField = (record: PardotFormHandlerField): FormField => {
  return {
    id: record.id.toString(),
    name: record.name,
    formId: record.formHandlerId.toString(),
    required: record.isRequired,
    dataFormat: record.dataFormat,
    validationMessage: record.errorMessage,
    rawData: record,
  };
};
