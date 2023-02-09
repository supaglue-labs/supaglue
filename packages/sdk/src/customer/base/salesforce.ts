import { SalesforceObjectConfig } from '../common';
import { BaseCustomerIntegration } from './base';

export type SalesforceCustomerIntegration = BaseCustomerIntegration & {
  type: 'salesforce';
  objectConfig: SalesforceObjectConfig;
};
