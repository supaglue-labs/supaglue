import type { ConnectionUnsafe, Provider } from '@supaglue/types';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractCrmRemoteClient } from '../../categories/crm/base';

class ZohoCrmClient extends AbstractCrmRemoteClient {
  public constructor() {
    // TODO: Support baseUrl
    super('missing-base-url');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'zoho_crm'>, provider: Provider): ZohoCrmClient {
  return new ZohoCrmClient();
}

// TODO: support other geographies
export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://accounts.zoho.com',
  tokenPath: '/oauth/v2/token',
  authorizeHost: 'https://accounts.zoho.com',
  authorizePath: '/oauth/v2/auth',
};
