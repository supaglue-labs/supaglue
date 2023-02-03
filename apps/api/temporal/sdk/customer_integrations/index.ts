import { createSalesforce, SalesforceCustomerIntegration } from './salesforce';

export type CustomerIntegrations = {
  salesforce: SalesforceCustomerIntegration;
};

export const createCustomerIntegrations = (customerId: string) => {
  return {
    salesforce: createSalesforce(customerId),
  };
};

export { SalesforceCustomerIntegration } from './salesforce';
