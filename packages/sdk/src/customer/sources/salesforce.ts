import { SalesforceSource } from '@supaglue/types';

export function salesforce(params: Omit<SalesforceSource, 'type'>): SalesforceSource {
  return {
    type: 'salesforce',
    ...params,
  };
}
