import { ConnectionUnsafe, Provider, ProviderCategory, ProviderName } from '@supaglue/types';
import { AbstractRemoteClient, RemoteClient } from './base';
import * as capsule from './impl/capsule';
import * as hubspot from './impl/hubspot';
import * as ms_dynamics_365_sales from './impl/ms_dynamics_365_sales';
import * as outreach from './impl/outreach';
import * as pipedrive from './impl/pipedrive';
import * as salesforce from './impl/salesforce';
import * as zendesk_sell from './impl/zendesk_sell';
import * as zoho_crm from './impl/zoho_crm';

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
  additionalScopes?: string[];
};

export type ConnectorConfig<T extends ProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, provider: Provider) => AbstractRemoteClient;
};

// TODO: Can we import from crmConnectorConfigMap and engagementConnectorConfigMap?
const connectorConfigMap: {
  [K in ProviderName]: ConnectorConfig<K>;
} = {
  salesforce,
  hubspot,
  pipedrive,
  zendesk_sell,
  ms_dynamics_365_sales,
  capsule,
  zoho_crm,
  outreach,
};

// `authConfig` to be used in simple-oauth2
export function getConnectorAuthConfig(category: ProviderCategory, providerName: ProviderName): ConnectorAuthConfig {
  const { authConfig } = connectorConfigMap[providerName];
  return authConfig;
}

export function getRemoteClient<T extends ProviderName>(
  connection: ConnectionUnsafe<T>,
  provider: Provider
): RemoteClient {
  const { newClient } = connectorConfigMap[connection.providerName];
  const client = newClient(connection, provider);

  // Intercept and log errors to remotes
  return new Proxy(client, {
    get(target, p) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const v = target[p];
      if (typeof v !== 'function') {
        return v;
      }

      return new Proxy(v, {
        apply(_target, thisArg, argArray) {
          try {
            const res = v.apply(target, argArray);
            if (Promise.resolve(res) === res) {
              // if it's a promise
              return (res as Promise<unknown>).catch((err) => {
                throw target.handleErr(err);
              });
            }
            return res;
          } catch (err: unknown) {
            throw target.handleErr(err);
          }
        },
      });
    },
  });
}

export function getCategoryForProvider(providerName: ProviderName): ProviderCategory {
  switch (providerName) {
    case 'salesforce':
    case 'hubspot':
    case 'pipedrive':
    case 'zendesk_sell':
    case 'ms_dynamics_365_sales':
    case 'capsule':
    case 'zoho_crm':
      return 'crm';
    case 'outreach':
      return 'engagement';
  }
}
