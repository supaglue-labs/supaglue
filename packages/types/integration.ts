import { CRMProviderName } from './crm';
import { EngagementProviderName } from './engagement';
import { SyncConfig } from './sync_config';

export type CRMIntegration = {
  id: string;
  applicationId: string;
  authType: 'oauth2';
  category: 'crm';
  providerName: CRMProviderName;
  config: IntegrationConfigDecrypted;
};

export type EngagementIntegration = {
  id: string;
  applicationId: string;
  authType: 'oauth2';
  category: 'engagement';
  providerName: EngagementProviderName;
  config: IntegrationConfigDecrypted;
};

export type IntegrationConfigDecrypted = {
  providerAppId: string;
  oauth: OauthConfigDecrypted;
  sync: SyncConfig;
};

export type IntegrationConfigEncrypted = {
  providerAppId: string;
  oauth: OauthConfigEncrypted;
  sync: SyncConfig;
};

export type OauthConfigDecrypted = {
  oauthScopes: string[];
  credentials: OauthCredentials;
};

export type OauthConfigEncrypted = {
  oauthScopes: string[];
  credentials: string;
};

export type OauthCredentials = {
  oauthClientId: string;
  oauthClientSecret: string;
};

// TODO: Update params should not contain applicationId even if create params does.
export type CRMIntegrationCreateParams = Omit<CRMIntegration, 'id'>;
export type CRMIntegrationUpdateParams = Omit<CRMIntegration, 'id'>;

export type EngagementIntegrationCreateParams = Omit<EngagementIntegration, 'id'>;
export type EngagementIntegrationUpdateParams = Omit<EngagementIntegration, 'id'>;

export type Integration = CRMIntegration | EngagementIntegration;
export type IntegrationCreateParams = CRMIntegrationCreateParams | EngagementIntegrationCreateParams;
export type IntegrationUpdateParams = CRMIntegrationUpdateParams | EngagementIntegrationUpdateParams;
