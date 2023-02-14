import { Sync, SyncConfig } from '@supaglue/types';
import { createCustomerIntegrations, CustomerIntegrations } from './customer_integrations';
import { createInternalIntegrations, InternalIntegrations } from './internal_integrations';

export type Supaglue = {
  customerId: string;
  customerIntegrations: CustomerIntegrations;
  internalIntegrations: InternalIntegrations;
};

export const createSupaglue = (sync: Sync, syncConfig: SyncConfig, syncRunId: string): Supaglue => {
  return {
    customerId: sync.customerId,
    customerIntegrations: createCustomerIntegrations(sync, syncConfig, syncRunId),
    internalIntegrations: createInternalIntegrations(sync, syncConfig, syncRunId),
  };
};
