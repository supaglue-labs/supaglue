import { ConnectionUnsafe, CRMCommonModelType, CRMCommonModelTypeMap, Integration } from '@supaglue/types';
import { Readable } from 'stream';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';

class PipedriveClient extends AbstractCrmRemoteClient {
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

export function newClient(connection: ConnectionUnsafe<'pipedrive'>, integration: Integration): PipedriveClient {
  return new PipedriveClient();
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://oauth.pipedrive.com',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://oauth.pipedrive.com',
  authorizePath: '/oauth/authorize',
};
