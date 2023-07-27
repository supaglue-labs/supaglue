import type {
  ConnectionUnsafe,
  NoCategoryProvider,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import axios from 'axios';
import { REFRESH_TOKEN_THRESHOLD_MS } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractNoCategoryRemoteClient } from '../../categories/no_category/base';

type IntercomClientConfig = {
  instanceUrl: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
};

class IntercomClient extends AbstractNoCategoryRemoteClient {
  readonly #config: IntercomClientConfig;
  public constructor(config: IntercomClientConfig) {
    super('https://api.intercom.io');
    this.#config = config;
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#config.accessToken}`,
    };
  }

  private async maybeRefreshAccessToken(): Promise<void> {
    if (!this.#config.expiresAt || Date.parse(this.#config.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS) {
      const { data } = await axios.post<{ access_token: string; refresh_token: string; expires_in: number }>(
        `${authConfig.tokenHost}${authConfig.tokenPath}`,
        null,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.#config.clientId}:${this.#config.clientSecret}`).toString(
              'base64'
            )}`,
          },
          params: {
            grant_type: 'refresh_token',
            refresh_token: this.#config.refreshToken,
          },
        }
      );

      const { access_token, refresh_token, expires_in } = data;

      const newExpiresAt = new Date(Date.now() + expires_in * 1000).toISOString();
      this.#config.accessToken = access_token;
      this.#config.refreshToken = refresh_token;
      this.#config.expiresAt = newExpiresAt;
      this.emit('token_refreshed', {
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: newExpiresAt,
      });
    }
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    await this.maybeRefreshAccessToken();
    return await super.sendPassthroughRequest(request);
  }
}

export function newClient(connection: ConnectionUnsafe<'intercom'>, provider: Provider): IntercomClient {
  return new IntercomClient({
    instanceUrl: connection.instanceUrl,
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    expiresAt: connection.credentials.expiresAt,
    clientId: (provider as NoCategoryProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as NoCategoryProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.intercom.io',
  tokenPath: '/auth/eagle/token',
  authorizeHost: 'https://api.intercom.io',
  authorizePath: '/oauth',
};
