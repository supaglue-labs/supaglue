import { SyncConfig } from '../../../developer_config/entities';
import { Sync } from '../../../syncs/entities';
import {
  createDestinationSalesforce,
  createSourceSalesforce,
  SalesforceCustomerDestinationIntegration,
  SalesforceCustomerSourceIntegration,
} from './salesforce';

export type CustomerIntegrations = {
  sources: {
    salesforce: SalesforceCustomerSourceIntegration;
  };
  destinations: {
    salesforce: SalesforceCustomerDestinationIntegration;
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

export { SalesforceCustomerDestinationIntegration, SalesforceCustomerSourceIntegration } from './salesforce';
