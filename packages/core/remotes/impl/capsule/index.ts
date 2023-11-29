import type { ConnectionUnsafe, Provider } from '@supaglue/types';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';

class CapsuleClient extends AbstractCrmRemoteClient {
  public constructor() {
    // TODO: Support baseUrl
    super('missing-base-url');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'capsule'>, provider: Provider): CapsuleClient {
  return new CapsuleClient();
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.capsulecrm.com',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://api.capsulecrm.com',
  authorizePath: '/oauth/authorise',
};
