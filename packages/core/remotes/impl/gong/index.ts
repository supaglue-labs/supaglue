import type { ConnectionUnsafe, Provider } from '@supaglue/types';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';

type GongClientConfig = {
  instanceUrl: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
};

class GongClient extends AbstractEngagementRemoteClient {
  readonly #config: GongClientConfig;

  public constructor(config: GongClientConfig) {
    super(config.instanceUrl);
    this.#config = config;
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#config.accessToken}`,
    };
  }
}

export function newClient(connection: ConnectionUnsafe<'gong'>, provider: Provider): GongClient {
  return new GongClient({
    instanceUrl: connection.instanceUrl,
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    expiresAt: connection.credentials.expiresAt,
    clientId: provider.config.oauth.credentials.oauthClientId,
    clientSecret: provider.config.oauth.credentials.oauthClientSecret,
  });
}

// TODO: support other geographies
export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://app.gong.io',
  tokenPath: '/oauth2/generate-customer-token',
  authorizeHost: 'https://app.gong.io',
  authorizePath: '/oauth2/authorize',
};
