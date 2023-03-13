import { IntegrationCategory } from './common';
import { CRMProviderName } from './crm';
import { SyncConfig } from './sync_config';

export type BaseIntegration = {
  id: string;
  applicationId: string;
  authType: 'oauth2';
  category: IntegrationCategory;
  providerName: CRMProviderName;
  isEnabled: boolean;
};

export type IncompleteCRMIntegration = BaseIntegration & {
  config?: IntegrationConfig;
};

export type CRMIntegration = IncompleteCRMIntegration & {
  config: IntegrationConfig;
};

export type IntegrationConfig = {
  providerAppId: string;
  oauth: OauthConfig;
  sync: SyncConfig;
};

export type OauthConfig = {
  oauthScopes: string[];
  credentials: OauthCredentials;
};

export type OauthCredentials = {
  oauthClientId: string;
  oauthClientSecret: string;
};

type BaseCRMIntegrationCreateParams = Omit<IncompleteCRMIntegration, 'id'>;
type BaseCRMIntegrationUpdateParams = Omit<IncompleteCRMIntegration, 'id'>;
export type CRMIntegrationCreateParams = BaseCRMIntegrationCreateParams;
export type CRMIntegrationUpdateParams = BaseCRMIntegrationUpdateParams;

export type Integration = CRMIntegration;
