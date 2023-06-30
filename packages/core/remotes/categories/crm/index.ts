import type { ConnectionUnsafe, CRMProvider } from '@supaglue/types';
import type { CRMProviderName } from '@supaglue/types/crm';
import type { ConnectorAuthConfig } from '../../base';
import * as capsule from '../../impl/capsule';
import * as hubspot from '../../impl/hubspot';
import * as ms_dynamics_365_sales from '../../impl/ms_dynamics_365_sales';
import * as pipedrive from '../../impl/pipedrive';
import * as salesforce from '../../impl/salesforce';
import * as zendesk_sell from '../../impl/zendesk_sell';
import * as zoho_crm from '../../impl/zoho_crm';
import { AbstractCrmRemoteClient, CrmRemoteClient } from './base';

type CrmConnectorConfig<T extends CRMProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, provider: CRMProvider) => AbstractCrmRemoteClient;
};

export const crmConnectorConfigMap: {
  [K in CRMProviderName]: CrmConnectorConfig<K>;
} = {
  salesforce,
  hubspot,
  pipedrive,
  zendesk_sell,
  ms_dynamics_365_sales,
  capsule,
  zoho_crm,
};

export function getCrmRemoteClient<T extends CRMProviderName>(
  connection: ConnectionUnsafe<T>,
  provider: CRMProvider
): CrmRemoteClient {
  const { newClient } = crmConnectorConfigMap[connection.providerName];
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
