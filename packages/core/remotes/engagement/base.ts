import { ConnectionUnsafe, EngagementProvider, ProviderCategory } from '@supaglue/types';
import {
  EngagementCommonModelType,
  EngagementCommonModelTypeMap,
  EngagementProviderName,
} from '@supaglue/types/engagement';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface EngagementRemoteClient extends RemoteClient {
  category(): ProviderCategory;
  listCommonModelRecords(commonModelType: EngagementCommonModelType, updatedAfter?: Date): Promise<Readable>;
  getCommonModelRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<EngagementCommonModelTypeMap<T>['object']>;
  createCommonModelRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  updateCommonModelRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['updateParams']
  ): Promise<string>;
}

export abstract class AbstractEngagementRemoteClient extends AbstractRemoteClient implements EngagementRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public category(): ProviderCategory {
    return 'engagement';
  }

  public handleErr(err: unknown): unknown {
    return err;
  }

  abstract listCommonModelRecords(commonModelType: EngagementCommonModelType, updatedAfter?: Date): Promise<Readable>;
  abstract getCommonModelRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<EngagementCommonModelTypeMap<T>['object']>;
  abstract createCommonModelRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  abstract updateCommonModelRecord<T extends EngagementCommonModelType>(
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
  newClient: (connection: ConnectionUnsafe<T>, provider: EngagementProvider) => AbstractEngagementRemoteClient;
};
