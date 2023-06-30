import { ConnectionUnsafe, EngagementProvider, ProviderCategory } from '@supaglue/types';
import {
  EngagementCommonObjectType,
  EngagementCommonObjectTypeMap,
  EngagementProviderName,
} from '@supaglue/types/engagement';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface EngagementRemoteClient extends RemoteClient {
  category(): ProviderCategory;
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

  public category(): ProviderCategory {
    return 'engagement';
  }

  public handleErr(err: unknown): unknown {
    return err;
  }

  abstract listCommonObjectRecords(
    commonObjectType: EngagementCommonObjectType,
    updatedAfter?: Date
  ): Promise<Readable>;
  abstract getCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    id: string
  ): Promise<EngagementCommonObjectTypeMap<T>['object']>;
  abstract createCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['createParams']
  ): Promise<string>;
  abstract updateCommonObjectRecord<T extends EngagementCommonObjectType>(
    commonObjectType: T,
    params: EngagementCommonObjectTypeMap<T>['updateParams']
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
