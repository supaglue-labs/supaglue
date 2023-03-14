import { CRMConnectionUnsafe } from '../../types/connection';
import { CRMProviderName } from '../../types/crm';
import { CompleteIntegration } from '../../types/integration';
import { ConnectorAuthConfig, CrmConnectorConfig, CrmRemoteClient } from './base';
import * as capsule from './capsule';
import * as hubspot from './hubspot';
import * as ms_dynamics_365_sales from './ms_dynamics_365_sales';
import * as pipedrive from './pipedrive';
import * as salesforce from './salesforce';
import * as zendesk_sell from './zendesk_sell';
import * as zoho_crm from './zoho_crm';

const crmConnectorConfigMap: Record<CRMProviderName, CrmConnectorConfig> = {
  salesforce,
  hubspot,
  pipedrive,
  zendesk_sell,
  ms_dynamics_365_sales,
  capsule,
  zoho_crm,
};

export function getConnectorAuthConfig(providerName: CRMProviderName): ConnectorAuthConfig {
  const { authConfig } = crmConnectorConfigMap[providerName];
  return authConfig;
}

export function getCrmRemoteClient(connection: CRMConnectionUnsafe, integration: CompleteIntegration): CrmRemoteClient {
  const { newClient } = crmConnectorConfigMap[connection.providerName];
  return newClient(connection, integration);
}
