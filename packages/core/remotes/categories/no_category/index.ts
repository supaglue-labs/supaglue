import type { ConnectionUnsafe, NoCategoryProvider } from '@supaglue/types';
import type { NoCategoryProviderName } from '@supaglue/types/no_category';
import type { ConnectorAuthConfig, RemoteClient } from '../../base';
import * as gong from '../../impl/gong';
import * as intercom from '../../impl/intercom';
import type { AbstractNoCategoryRemoteClient } from './base';

export type NoCategoryConnectorConfig<T extends NoCategoryProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, provider: NoCategoryProvider) => AbstractNoCategoryRemoteClient;
};

export const NoCategoryConnectorConfigMap: {
  [K in NoCategoryProviderName]: NoCategoryConnectorConfig<K>;
} = {
  intercom,
  gong,
};

export function getNoCategoryRemoteClient<T extends NoCategoryProviderName>(
  connection: ConnectionUnsafe<T>,
  provider: NoCategoryProvider
): RemoteClient {
  const { newClient } = NoCategoryConnectorConfigMap[connection.providerName];
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
