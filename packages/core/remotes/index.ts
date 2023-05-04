import { CRMProviderName, IntegrationCategory, ProviderName } from '@supaglue/types';
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

export function getConnectorAuthConfig(category: IntegrationCategory, providerName: ProviderName): ConnectorAuthConfig {
  if (category === 'crm') {
    const { authConfig } = crmConnectorConfigMap[providerName as CRMProviderName];
    return authConfig;
  }
  const { authConfig } = engagementConnectorConfigMap[providerName as EngagementProviderName];
  return authConfig;
}
