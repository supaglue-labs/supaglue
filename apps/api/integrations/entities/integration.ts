import { SALESFORCE } from '../../constants';

type BaseIntegration = {
  id: string;
  customerId: string;
};

export type SalesforceIntegrationCredentials = {
  refreshToken: string;
  instanceUrl: string;
  organizationId: string;
};

export type UnsafeSalesforceIntegration = BaseIntegration & {
  type: typeof SALESFORCE;
  credentials: SalesforceIntegrationCredentials;
};

export type SafeSalesforceIntegration = BaseIntegration & {
  type: typeof SALESFORCE;
  credentials: Buffer;
};

export type UnsafeIntegration = UnsafeSalesforceIntegration;
export type SafeIntegration = SafeSalesforceIntegration;

export type IntegrationCreateParams = Omit<UnsafeIntegration, 'id'>;
