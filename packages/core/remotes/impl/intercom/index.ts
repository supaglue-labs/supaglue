import type { ConnectionUnsafe, NoCategoryProvider, Provider } from '@supaglue/types';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractNoCategoryRemoteClient } from '../../categories/no_category/base';

type IntercomClientConfig = {
  accessToken: string;
  clientId: string;
  clientSecret: string;
};

class IntercomClient extends AbstractNoCategoryRemoteClient {
  readonly #config: IntercomClientConfig;
  public constructor(config: IntercomClientConfig) {
    super('https://api.intercom.io');
    this.#config = config;
  }

  #getAuthHeaders(): Record<string, string> {
    return {
      'Intercom-Version': '2.9',
      accept: 'application/json',
      'content-type': 'application/json',
      Authorization: `Bearer ${this.#config.accessToken}`,
    };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.#getAuthHeaders();
  }
}

export function newClient(connection: ConnectionUnsafe<'intercom'>, provider: Provider): IntercomClient {
  return new IntercomClient({
    // Note: Intercom access tokens never expire.
    accessToken: connection.credentials.accessToken,
    clientId: (provider as NoCategoryProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as NoCategoryProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.intercom.io',
  tokenPath: '/auth/eagle/token',
  authorizeHost: 'https://app.intercom.io',
  authorizePath: '/oauth',
};
