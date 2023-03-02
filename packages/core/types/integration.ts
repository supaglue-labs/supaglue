import { IntegrationCategory } from './common';
import { CRMProviderName } from './crm';
import { SyncConfig } from './sync_config';

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

export type Integration = CRMIntegration;
