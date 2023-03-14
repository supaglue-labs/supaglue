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
  config?: IntegrationConfigDecrypted;
};

export type CRMIntegration = IncompleteCRMIntegration & {
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

type BaseCRMIntegrationCreateParams = Omit<IncompleteCRMIntegration, 'id'>;
type BaseCRMIntegrationUpdateParams = Omit<IncompleteCRMIntegration, 'id'>;
export type CRMIntegrationCreateParams = BaseCRMIntegrationCreateParams;
export type CRMIntegrationUpdateParams = BaseCRMIntegrationUpdateParams;

export type CompleteIntegration = CRMIntegration;
export type IncompleteIntegration = IncompleteCRMIntegration;

export type Integration = CompleteIntegration | IncompleteIntegration;
