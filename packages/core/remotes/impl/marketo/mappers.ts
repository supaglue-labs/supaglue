import type { FormField } from '@supaglue/types/marketing_automation/form_field';
import type { FormMetadata } from '@supaglue/types/marketing_automation/form_metadata';
import type { MarketoForm, MarketoFormField } from '.';

export const fromMarketoFormToFormMetadata = (marketoForm: MarketoForm): FormMetadata => {
  return {
    id: marketoForm.id.toString(),
    name: marketoForm.name,
    createdAt: new Date(marketoForm.createdAt),
    updatedAt: new Date(marketoForm.updatedAt),
    rawData: marketoForm,
  };
};

export const fromMarketoFormFieldToFormField = (marketoFormField: MarketoFormField, formId: string): FormField => {
  return {
    id: marketoFormField.id,
    name: marketoFormField.label,
    required: marketoFormField.required,
    dataFormat: marketoFormField.dataType,
    dataOptions: marketoFormField.fieldMetaData?.values.map(({ label, value, isDefault }) => ({
      label,
      value,
      isDefault,
    })),
    validationMessage: marketoFormField.validationMessage,
    formId,
    rawData: marketoFormField,
  };
};
