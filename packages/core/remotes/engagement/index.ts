import { ConnectionUnsafe, EngagementProvider } from '@supaglue/types';
import { EngagementProviderName } from '@supaglue/types/engagement';
import { EngagementConnectorConfig, EngagementRemoteClient } from './base';
import * as outreach from './outreach';

export const engagementConnectorConfigMap: {
  [K in EngagementProviderName]: EngagementConnectorConfig<K>;
} = {
  outreach,
};

export function getEngagementRemoteClient<T extends EngagementProviderName>(
  connection: ConnectionUnsafe<T>,
  provider: EngagementProvider
): EngagementRemoteClient {
  const { newClient } = engagementConnectorConfigMap[connection.providerName];
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
          } catch (err: unknown) {
            throw target.handleErr(err);
          }
        },
      });
    },
  });
}
