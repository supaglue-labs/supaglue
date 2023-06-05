import { ConnectionUnsafe, Integration, IntegrationCategory } from '@supaglue/types';
import {
  EngagementCommonModelType,
  EngagementCommonModelTypeMap,
  EngagementProviderName,
} from '@supaglue/types/engagement';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface EngagementRemoteClient extends RemoteClient {
  category(): IntegrationCategory;
  listObjects(commonModelType: EngagementCommonModelType, updatedAfter?: Date): Promise<Readable>;
  getObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<EngagementCommonModelTypeMap<T>['object']>;
  createObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  updateObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['updateParams']
  ): Promise<string>;
}

export abstract class AbstractEngagementRemoteClient extends AbstractRemoteClient implements EngagementRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public category(): IntegrationCategory {
    return 'engagement';
  }

  public handleErr(err: unknown): unknown {
    return err;
  }

  abstract listObjects(commonModelType: EngagementCommonModelType, updatedAfter?: Date): Promise<Readable>;
  abstract getObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<EngagementCommonModelTypeMap<T>['object']>;
  abstract createObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  abstract updateObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['updateParams']
  ): Promise<string>;
}

export abstract class EngagementRemoteClientEventEmitter extends EventEmitter {}

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
};

export type EngagementConnectorConfig<T extends EngagementProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, integration: Integration) => AbstractEngagementRemoteClient;
};
