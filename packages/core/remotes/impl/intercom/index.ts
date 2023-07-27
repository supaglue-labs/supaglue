import type { ConnectionUnsafe, Provider } from '@supaglue/types';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractNoCategoryRemoteClient } from '../../categories/no_category/base';

class IntercomClient extends AbstractNoCategoryRemoteClient {
  public constructor() {
    super('https://api.intercom.io');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'intercom'>, provider: Provider): IntercomClient {
  return new IntercomClient();
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.intercom.io',
  tokenPath: '/auth/eagle/token',
  authorizeHost: 'https://api.intercom.io',
  authorizePath: '/oauth',
};
