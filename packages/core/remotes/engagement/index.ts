import { ConnectionUnsafe, Integration } from '@supaglue/types';
import { EngagementProviderName } from '@supaglue/types/engagement';
import { logger } from '../../lib/logger';
import { ConnectorAuthConfig, EngagementConnectorConfig, EngagementRemoteClient } from './base';
import * as outreach from './outreach';

const engagementConnectorConfigMap: {
  [K in EngagementProviderName]: EngagementConnectorConfig<K>;
} = {
  outreach,
};

export function getConnectorAuthConfig(providerName: EngagementProviderName): ConnectorAuthConfig {
  const { authConfig } = engagementConnectorConfigMap[providerName];
  return authConfig;
}

export function getEngagementRemoteClient<T extends EngagementProviderName>(
  connection: ConnectionUnsafe<T>,
  integration: Integration
): EngagementRemoteClient {
  const { newClient } = engagementConnectorConfigMap[connection.providerName];
  const client = newClient(connection, integration);

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
                logger.error(
                  {
                    error: err,
                    client: target.constructor.name,
                    method: p,
                    args: argArray,
                  },
                  'remote client error'
                );
                throw err;
              });
            }
          } catch (err: unknown) {
            logger.error(
              {
                error: err,
                client: target.constructor.name,
                method: p,
                args: argArray,
              },
              'remote client error'
            );
            throw err;
          }
        },
      });
    },
  });
}
