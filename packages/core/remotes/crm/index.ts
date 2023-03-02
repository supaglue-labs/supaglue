import { CRMConnection } from '../../types/connection';
import { CRMProviderName } from '../../types/crm';
import { Integration } from '../../types/integration';
import { ConnectorAuthConfig, CrmConnectorConfig, CrmRemoteClient } from './base';
import * as hubspot from './hubspot';
import * as pipedrive from './pipedrive';
import * as salesforce from './salesforce';

const crmConnectorConfigMap: Record<CRMProviderName, CrmConnectorConfig> = {
  salesforce,
  hubspot,
  pipedrive,
};

export function getConnectorAuthConfig(providerName: CRMProviderName): ConnectorAuthConfig {
  const { authConfig } = crmConnectorConfigMap[providerName];
  return authConfig;
}

export function getCrmRemoteClient(connection: CRMConnection, integration: Integration): CrmRemoteClient {
  const { newClient } = crmConnectorConfigMap[connection.providerName];
  return newClient(connection, integration);
}
