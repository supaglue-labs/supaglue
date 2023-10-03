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
  const lowercased = lowercaseFirstLetter(marketoFormField.id);
  return {
    id: MARKETO_LEAD_FIELDS.includes(lowercased) ? lowercased : marketoFormField.id,
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

const lowercaseFirstLetter = (input: string): string => {
  if (!input) {
    return '';
  }
  return input.charAt(0).toLowerCase() + input.slice(1);
};

// The submit form REST API actually expects lead fields instead of the Form Fields.
// There doesn't seem to be a formalized mapping from FormFields (which are usually PascalCase) to lead fields (which are camelCase).
// See https://nation.marketo.com/t5/product-discussions/how-do-i-view-the-contents-of-a-form-submission/m-p/210329#M154306 for more details
const MARKETO_LEAD_FIELDS = [
  'acquisitionProgramId',
  'address',
  'annualRevenue',
  'anonymousIP',
  'billingCity',
  'billingCountry',
  'billingPostalCode',
  'billingState',
  'billingStreet',
  'blackListed',
  'blackListedCause',
  'city',
  'company',
  'contactCompany',
  'cookies',
  'country',
  'createdAt',
  'dateOfBirth',
  'department',
  'doNotCall',
  'doNotCallReason',
  'ecids',
  'email',
  'emailInvalid',
  'emailInvalidCause',
  'emailSuspended',
  'emailSuspendedAt',
  'emailSuspendedCause',
  'externalCompanyId',
  'externalSalesPersonId',
  'fax',
  'firstName',
  'id',
  'industry',
  'inferredCity',
  'inferredCompany',
  'inferredCountry',
  'inferredMetropolitanArea',
  'inferredPhoneAreaCode',
  'inferredPostalCode',
  'inferredStateRegion',
  'isAnonymous',
  'isLead',
  'lastName',
  'leadPartitionId',
  'leadPerson',
  'leadRevenueCycleModelId',
  'leadRevenueStageId',
  'leadRole',
  'leadScore',
  'leadSource',
  'leadStatus',
  'mainPhone',
  'marketingSuspended',
  'marketingSuspendedCause',
  'middleName',
  'mktoAcquisitionDate',
  'mktoCompanyNotes',
  'mktoDoNotCallCause',
  'mktoIsCustomer',
  'mktoIsPartner',
  'mktoName',
  'mktoPersonNotes',
  'mobilePhone',
  'numberOfEmployees',
  'originalReferrer',
  'originalSearchEngine',
  'originalSearchPhrase',
  'originalSourceInfo',
  'originalSourceType',
  'personPrimaryLeadInterest',
  'personTimeZone',
  'personType',
  'phone',
  'postalCode',
  'priority',
  'rating',
  'registrationSourceInfo',
  'registrationSourceType',
  'relativeScore',
  'relativeUrgency',
  'salutation',
  'sicCode',
  'site',
  'state',
  'title',
  'unsubscribed',
  'unsubscribedReason',
  'updatedAt',
  'urgency',
  'website',
];
