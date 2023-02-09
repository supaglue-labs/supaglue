import { SalesforceCustomerIntegration } from '../base';

export type SalesforceDestination = SalesforceCustomerIntegration & {
  upsertKey: string; // ext_id
};

export function salesforce(params: Omit<SalesforceDestination, 'type'>): SalesforceDestination {
  return {
    type: 'salesforce',
    ...params,
  };
}
