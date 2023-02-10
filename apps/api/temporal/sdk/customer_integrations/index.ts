import { SyncConfig } from '../../../developer_config/entities';
import { Sync } from '../../../syncs/entities';
import {
  createDestinationSalesforce,
  createSourceSalesforce,
  CustomerSalesforceDestinationIntegration,
  CustomerSalesforceSourceIntegration,
} from './salesforce';

export type CustomerIntegrations = {
  sources: {
    salesforce: CustomerSalesforceSourceIntegration;
  };
  destinations: {
    salesforce: CustomerSalesforceDestinationIntegration;
  };
};

export const createCustomerIntegrations = (sync: Sync, syncConfig: SyncConfig, syncRunId: string) => {
  return {
    sources: {
      salesforce: createSourceSalesforce(sync, syncConfig, syncRunId),
    },
    destinations: {
      salesforce: createDestinationSalesforce(sync, syncConfig, syncRunId),
    },
  };
};

export { CustomerSalesforceDestinationIntegration, CustomerSalesforceSourceIntegration } from './salesforce';
