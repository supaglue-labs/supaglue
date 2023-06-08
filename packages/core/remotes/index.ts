import { ProviderCategory, ProviderName } from '@supaglue/types';
import { CRMProviderName } from '@supaglue/types/crm';
import { EngagementProviderName } from '@supaglue/types/engagement';
import { crmConnectorConfigMap } from './crm';
import { engagementConnectorConfigMap } from './engagement';

export * as crm from './crm';
export * as engagement from './engagement';

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
};

export type AdditionalConnectorAuthConfig = {
  authorizeWithScope: boolean;
};

// `authConfig` to be used in simple-oauth2
export function getConnectorAuthConfig(category: ProviderCategory, providerName: ProviderName): ConnectorAuthConfig {
  if (category === 'crm') {
    const { authConfig } = crmConnectorConfigMap[providerName as CRMProviderName];
    return authConfig;
  }
  const { authConfig } = engagementConnectorConfigMap[providerName as EngagementProviderName];
  return authConfig;
}

// The `authConfig` object can't be polluted with additional fields, so pass additional fields here
export function getAdditionalConnectorAuthConfig(
  category: ProviderCategory,
  providerName: ProviderName
): AdditionalConnectorAuthConfig {
  if (category === 'crm') {
    const { additionalAuthConfig } = crmConnectorConfigMap[providerName as CRMProviderName];
    return additionalAuthConfig;
  }
  const { additionalAuthConfig } = engagementConnectorConfigMap[providerName as EngagementProviderName];
  return additionalAuthConfig;
}
