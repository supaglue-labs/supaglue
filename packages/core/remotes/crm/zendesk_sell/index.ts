import { ConnectionUnsafe, CRMCommonModelType, CRMCommonModelTypeMap, CRMIntegration } from '@supaglue/types';
import { Readable } from 'stream';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';

class ZendeskSellClient extends AbstractCrmRemoteClient {
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

  public override createObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }

  public override updateObject<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }
}

export function newClient(
  connection: ConnectionUnsafe<'zendesk_sell'>,
  integration: CRMIntegration
): ZendeskSellClient {
  return new ZendeskSellClient();
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.getbase.com',
  tokenPath: '/oauth2/token',
  authorizeHost: 'https://api.getbase.com',
  authorizePath: '/oauth2/authorize',
};
