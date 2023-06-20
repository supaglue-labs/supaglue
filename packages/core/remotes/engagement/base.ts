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
  listCommonObjectRecords(commonModelType: EngagementCommonModelType, updatedAfter?: Date): Promise<Readable>;
  getCommonObjectRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<EngagementCommonModelTypeMap<T>['object']>;
  createCommonObjectRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  updateCommonObjectRecord<T extends EngagementCommonModelType>(
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

  abstract listCommonObjectRecords(commonModelType: EngagementCommonModelType, updatedAfter?: Date): Promise<Readable>;
  abstract getCommonObjectRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<EngagementCommonModelTypeMap<T>['object']>;
  abstract createCommonObjectRecord<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<string>;
  abstract updateCommonObjectRecord<T extends EngagementCommonModelType>(
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
  additionalScopes?: string[];
};

export type EngagementConnectorConfig<T extends EngagementProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, provider: EngagementProvider) => AbstractEngagementRemoteClient;
};
