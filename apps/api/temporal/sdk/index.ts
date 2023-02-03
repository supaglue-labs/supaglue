import { createCustomerIntegrations, CustomerIntegrations } from './customer_integrations';
import { internalIntegrations, InternalIntegrations } from './internal_integrations';

export type Supaglue = {
  customerIntegrations: CustomerIntegrations;
  internalIntegrations: InternalIntegrations;
};

export const createSupaglue = (customerId: string): Supaglue => {
  return {
    customerIntegrations: createCustomerIntegrations(customerId),
    internalIntegrations,
  };
};
