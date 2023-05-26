import { ConnectionUnsafe, CRMIntegration } from '@supaglue/types';
import { CRMCommonModelType, CRMCommonModelTypeMap } from '@supaglue/types/crm';
import { Readable } from 'stream';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';

class ZohoCrmClient extends AbstractCrmRemoteClient {
  public constructor() {
    // TODO: Support baseUrl
    super('missing-base-url');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
  }

  public override listObjects(commonModelType: CRMCommonModelType, updatedAfter?: Date): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public override getObject<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }

  public override createObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }

  public override updateObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'zoho_crm'>, integration: CRMIntegration): ZohoCrmClient {
  return new ZohoCrmClient();
}

// TODO: support other geographies
export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://accounts.zoho.com',
  tokenPath: '/oauth/v2/token',
  authorizeHost: 'https://accounts.zoho.com',
  authorizePath: '/oauth/v2/auth',
};
