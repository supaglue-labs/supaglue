import { OAuthConfigDecrypted, OAuthConfigEncrypted } from '.';
import { CRMProviderName } from './crm';
import { EngagementProviderName } from './engagement';

type BaseProvider = {
  id: string;
  applicationId: string;
  authType: 'oauth2';
};

export type CRMProvider = BaseProvider & {
  category: 'crm';
  name: CRMProviderName;
  config: ProviderConfigDecrypted;
};

export type EngagementProvider = BaseProvider & {
  category: 'engagement';
  name: EngagementProviderName;
  config: ProviderConfigDecrypted;
};

export type ProviderConfigDecrypted = {
  providerAppId: string;
  oauth: OAuthConfigDecrypted;
};

export type ProviderConfigEncrypted = {
  providerAppId: string;
  oauth: OAuthConfigEncrypted;
};

// TODO: Update params should not contain applicationId even if create params does.
export type CRMProviderCreateParams = Omit<CRMProvider, 'id'>;
export type CRMProviderUpdateParams = Omit<CRMProvider, 'id'>;

export type EngagementProviderCreateParams = Omit<EngagementProvider, 'id'>;
export type EngagementProviderUpdateParams = Omit<EngagementProvider, 'id'>;

export type Provider = CRMProvider | EngagementProvider;
export type ProviderCreateParams = CRMProviderCreateParams | EngagementProviderCreateParams;
export type ProviderUpdateParams = CRMProviderUpdateParams | EngagementProviderUpdateParams;
