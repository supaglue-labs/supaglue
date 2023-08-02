import type { ConnectionUnsafe, Provider, ProviderCategory, ProviderName } from '@supaglue/types';
import type { AbstractRemoteClient, ConnectorAuthConfig, RemoteClient } from './base';
import * as apollo from './impl/apollo';
import * as capsule from './impl/capsule';
import * as gong from './impl/gong';
import * as hubspot from './impl/hubspot';
import * as intercom from './impl/intercom';
import * as linear from './impl/linear';
import * as ms_dynamics_365_sales from './impl/ms_dynamics_365_sales';
import * as outreach from './impl/outreach';
import * as pipedrive from './impl/pipedrive';
import * as salesforce from './impl/salesforce';
import * as salesloft from './impl/salesloft';
import * as zendesk_sell from './impl/zendesk_sell';
import * as zoho_crm from './impl/zoho_crm';

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
  gong,
  apollo,
  salesloft,
  intercom,
  linear,
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
    case 'apollo':
    case 'salesloft':
      return 'engagement';
    case 'gong':
    case 'intercom':
    case 'linear':
      return 'no_category';
  }
}
