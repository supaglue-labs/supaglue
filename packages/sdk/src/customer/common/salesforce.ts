type SalesforceObject = 'Contact' | 'Lead' | 'Account' | 'Opportunity';

type SpecifiedSalesforceObjectConfig = {
  type: 'specified';
  object: SalesforceObject;
};

type SelectableSalesforceObjectConfig = {
  type: 'selectable';
  objectChoices: SalesforceObject[];
};

export type SalesforceObjectConfig = SpecifiedSalesforceObjectConfig | SelectableSalesforceObjectConfig;

export function specifiedSalesforceObjectConfig(object: SalesforceObject): SpecifiedSalesforceObjectConfig {
  return {
    type: 'specified',
    object,
  };
}

export function selectableSalesforceObjectConfig(objectChoices: SalesforceObject[]): SelectableSalesforceObjectConfig {
  return {
    type: 'selectable',
    objectChoices,
  };
}

export type SalesforceCredentials = {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
};

export function salesforceCredentials(params: SalesforceCredentials) {
  return params;
}
