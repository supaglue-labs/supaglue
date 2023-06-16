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
  additionalScopes?: string[];
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
