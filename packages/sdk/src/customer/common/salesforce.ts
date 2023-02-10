import {
  SalesforceCredentials,
  SalesforceObject,
  SelectableSalesforceObjectConfig,
  SpecifiedSalesforceObjectConfig,
} from '@supaglue/types';

export function specifiedObjectConfig(object: SalesforceObject): SpecifiedSalesforceObjectConfig {
  return {
    type: 'specified',
    object,
  };
}

export function selectableObjectConfig(objectChoices: SalesforceObject[]): SelectableSalesforceObjectConfig {
  return {
    type: 'selectable',
    objectChoices,
  };
}

export function credentials(params: SalesforceCredentials) {
  return params;
}
