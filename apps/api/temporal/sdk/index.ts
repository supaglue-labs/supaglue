import { createCustomerIntegrations, CustomerIntegrations } from './customer_integrations';
import { internalIntegrations, InternalIntegrations } from './internal_integrations';

export type Supaglue = {
  customerId: string;
  customerIntegrations: CustomerIntegrations;
  internalIntegrations: InternalIntegrations;
};

export const createSupaglue = (customerId: string): Supaglue => {
  return {
    customerId,
    customerIntegrations: createCustomerIntegrations(customerId),
    internalIntegrations,
  };
};
