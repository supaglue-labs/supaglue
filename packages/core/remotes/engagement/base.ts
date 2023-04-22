import { ConnectionUnsafe, Integration } from '@supaglue/types';
import {
  EngagementCommonModelType,
  EngagementCommonModelTypeMap,
  EngagementProviderName,
  SequenceStartParams,
} from '@supaglue/types/engagement';
import { EventEmitter } from 'events';
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface EngagementRemoteClient extends RemoteClient {
  createObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<EngagementCommonModelTypeMap<T>['object']>;
  startSequence(params: SequenceStartParams): Promise<void>;
}

export abstract class AbstractEngagementRemoteClient extends AbstractRemoteClient implements EngagementRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  abstract createObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<EngagementCommonModelTypeMap<T>['object']>;
  abstract startSequence(params: SequenceStartParams): Promise<void>;
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
