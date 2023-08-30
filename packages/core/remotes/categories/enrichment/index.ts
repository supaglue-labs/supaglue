import type { ConnectionUnsafe, EnrichmentProvider } from '@supaglue/types';
import type { EnrichmentProviderName } from '@supaglue/types/enrichment';
import type { ConnectorAuthConfig } from '../../base';
import * as sixsense from '../../impl/6sense';
import * as clearbit from '../../impl/clearbit';
import type { AbstractEnrichmentRemoteClient, EnrichmentRemoteClient } from './base';

export type EnrichmentConnectorConfig<T extends EnrichmentProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, provider: EnrichmentProvider) => AbstractEnrichmentRemoteClient;
};

export const enrichmentConnectorConfigMap: {
  [K in EnrichmentProviderName]: EnrichmentConnectorConfig<K>;
} = {
  clearbit,
  '6sense': sixsense,
};

export function getEnrichmentRemoteClient<T extends EnrichmentProviderName>(
  connection: ConnectionUnsafe<T>,
  provider: EnrichmentProvider
): EnrichmentRemoteClient {
  const { newClient } = enrichmentConnectorConfigMap[connection.providerName];
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
