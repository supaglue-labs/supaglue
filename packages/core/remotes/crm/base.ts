import {
  ConnectionUnsafe,
  CRMCommonModelType,
  CRMCommonModelTypeMap,
  CRMIntegration,
  CRMProviderName,
  IntegrationCategory,
} from '@supaglue/types';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import { AbstractRemoteClient, RemoteClient } from '../base';

export interface CrmRemoteClient extends RemoteClient {
  category(): IntegrationCategory;
  listObjects(commonModelType: CRMCommonModelType, updatedAfter?: Date): Promise<Readable>;
  createObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']>;
  updateObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']>;
}

export abstract class AbstractCrmRemoteClient extends AbstractRemoteClient implements CrmRemoteClient {
  public constructor(...args: ConstructorParameters<typeof AbstractRemoteClient>) {
    super(...args);
  }

  public category(): IntegrationCategory {
    return 'crm';
  }

  abstract listObjects(commonModelType: CRMCommonModelType, updatedAfter?: Date): Promise<Readable>;
  abstract createObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']>;
  abstract updateObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']>;
}
export abstract class CrmRemoteClientEventEmitter extends EventEmitter {}

export type ConnectorAuthConfig = {
  tokenHost: string;
  tokenPath: string;
  authorizeHost: string;
  authorizePath: string;
};

export type CrmConnectorConfig<T extends CRMProviderName> = {
  authConfig: ConnectorAuthConfig;
  newClient: (connection: ConnectionUnsafe<T>, integration: CRMIntegration) => AbstractCrmRemoteClient;
};
