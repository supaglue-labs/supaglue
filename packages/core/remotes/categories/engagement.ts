import { ConnectionUnsafe, EngagementProvider } from '@supaglue/types';
import {
  EngagementCommonObjectType,
  EngagementCommonObjectTypeMap,
  EngagementProviderName,
} from '@supaglue/types/engagement';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { ConnectorAuthConfig } from '..';
import { AbstractRemoteClient, RemoteClient } from '../base';
import * as outreach from '../impl/outreach';

export interface EngagementRemoteClient extends RemoteClient {
  listCommonObjectRecords(commonObjectType: EngagementCommonObjectType, updatedAfter?: Date): Promise<Readable>;
  getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']>;
  createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<string>;
  updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<string>;
}

export abstract class AbstractEngagementRemoteClient extends AbstractRemoteClient implements EngagementRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public handleErr(err: unknown): unknown {
    return err;
  }

  public async listCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date
  ): Promise<Readable> {
    throw new Error('Not implemented');
  }
  public async getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }
  public async createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }
  public async updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }
}

export abstract class EngagementRemoteClientEventEmitter extends EventEmitter {}

export type EngagementConnectorConfig<T extends EngagementProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, provider: EngagementProvider) => AbstractEngagementRemoteClient;
};

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
