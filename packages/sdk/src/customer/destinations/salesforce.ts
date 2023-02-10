import { SalesforceDestination } from '@supaglue/types';

export function salesforce(params: Omit<SalesforceDestination, 'type'>): SalesforceDestination {
  return {
    type: 'salesforce',
    ...params,
  };
}
