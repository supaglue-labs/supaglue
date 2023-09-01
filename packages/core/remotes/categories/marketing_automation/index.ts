import type { ConnectionUnsafe, MarketingAutomationProvider } from '@supaglue/types';
import type { MarketingAutomationProviderName } from '@supaglue/types/marketing_automation';
import type { ConnectorAuthConfig } from '../../base';
import * as marketo from '../../impl/marketo';
import * as salesforce_marketing_cloud_account_engagement from '../../impl/salesforce_marketing_cloud_account_engagement';
import type { AbstractMarketingAutomationRemoteClient, MarketingAutomationRemoteClient } from './base';

type MarketingAutomationConnectorConfig<T extends MarketingAutomationProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (
    connection: ConnectionUnsafe<T>,
    provider: MarketingAutomationProvider
  ) => AbstractMarketingAutomationRemoteClient;
};

export const marketingAutomationConnectorConfigMap: {
  [K in MarketingAutomationProviderName]: MarketingAutomationConnectorConfig<K>;
} = {
  marketo,
  salesforce_marketing_cloud_account_engagement,
};

export function getMarketingAutmationRemoteClient<T extends MarketingAutomationProviderName>(
  connection: ConnectionUnsafe<T>,
  provider: MarketingAutomationProvider
): MarketingAutomationRemoteClient {
  const { newClient } = marketingAutomationConnectorConfigMap[connection.providerName];
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
