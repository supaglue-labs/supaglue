import { SalesforceCustomerIntegration } from '../base';

export type SalesforceSource = SalesforceCustomerIntegration;

export function salesforce(params: Omit<SalesforceSource, 'type'>): SalesforceSource {
  return {
    type: 'salesforce',
    ...params,
  };
}
