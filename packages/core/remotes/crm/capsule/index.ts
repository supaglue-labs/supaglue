import { ConnectionUnsafe, CRMIntegration } from '@supaglue/types';
import { CRMCommonModelType, CRMCommonModelTypeMap } from '@supaglue/types/crm';
import { Readable } from 'stream';
import { AbstractCrmRemoteClient, AdditionalConnectorAuthConfig, ConnectorAuthConfig } from '../base';

class CapsuleClient extends AbstractCrmRemoteClient {
  public constructor() {
    // TODO: Support baseUrl
    super('missing-base-url');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
  }

  public override listCommonModelRecords(commonModelType: CRMCommonModelType, updatedAfter?: Date): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public override getCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }

  public override createCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }

  public override updateCommonModelRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'capsule'>, integration: CRMIntegration): CapsuleClient {
  return new CapsuleClient();
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.capsulecrm.com',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://api.capsulecrm.com',
  authorizePath: '/oauth/authorise',
};

export const additionalAuthConfig: AdditionalConnectorAuthConfig = {
  authorizeWithScope: false, // unverified
};
