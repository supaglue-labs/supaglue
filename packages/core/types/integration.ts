import { IntegrationCategory } from './common';
import { CRMProviderName } from './crm';
import { SyncConfig } from './sync_config';

export type BaseIntegration = {
  id: string;
  applicationId: string;
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

type BaseCRMIntegrationCreateParams = Omit<CRMIntegration, 'id'>;
export type CRMIntegrationCreateParams = BaseCRMIntegrationCreateParams;
export type CRMIntegrationUpdateParams = BaseCRMIntegrationCreateParams;

export type Integration = CRMIntegration;
