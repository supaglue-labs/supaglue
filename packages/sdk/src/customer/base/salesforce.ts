import { SalesforceObjectConfig } from '../common/salesforce';
import { BaseCustomerIntegration } from './base';

export type SalesforceCustomerIntegration = BaseCustomerIntegration & {
  type: 'salesforce';
  objectConfig: SalesforceObjectConfig;
};
