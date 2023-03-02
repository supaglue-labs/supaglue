import type { IntegrationCategory } from './common';
import type { CRMProviderName } from './crm';

export type BaseIntegration = {
  id: string;
  authType: 'oauth2';
  config: IntegrationConfig;
};

export type CRMIntegration = BaseIntegration & {
  category: IntegrationCategory;
  providerName: CRMProviderName;
};

export type IntegrationConfig = {
  remoteProviderAppId: string;
  oauth: OauthConfig;
};

export type OauthConfig = {
  oauthScopes: string[];
  credentials: OauthCredentials;
};

export type OauthCredentials = {
  oauthClientId: string;
  oauthClientSecret: string;
};

export type Integration = CRMIntegration;
