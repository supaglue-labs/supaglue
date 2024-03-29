import axios from '@supaglue/core/remotes/sg_axios';
import type { ConnectionUnsafe, EngagementOauthProvider, Provider } from '@supaglue/types';
import { SGConnectionNoLongerAuthenticatedError } from '../../../errors';
import { REFRESH_TOKEN_THRESHOLD_MS } from '../../../lib';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractNoCategoryRemoteClient } from '../../categories/no_category/base';

type SlackClientConfig = {
  type: 'oauth2';
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
};

class SlackClient extends AbstractNoCategoryRemoteClient {
  readonly #config: SlackClientConfig;

  public constructor(config: SlackClientConfig) {
    super('https://slack.com/api');
    this.#config = config;
  }

  getAuthHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#config.accessToken}`,
    };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.getAuthHeaders();
  }

  /** Not used yet... but will soon */
  private async maybeRefreshAccessToken(): Promise<void> {
    if (this.#config.type !== 'oauth2') {
      return;
    }
    if (!this.#config.expiresAt || Date.parse(this.#config.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS) {
      try {
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
      } catch (e: any) {
        if (e.response?.status === 400) {
          throw new SGConnectionNoLongerAuthenticatedError('Unable to refresh access token. Refresh token invalid.');
        }
        throw e;
      }
    }
  }
}

export function newClient(connection: ConnectionUnsafe<'slack'>, provider: Provider): SlackClient {
  return new SlackClient({
    type: 'oauth2',
    accessToken: connection.credentials.accessToken,
    refreshToken: connection.credentials.refreshToken,
    expiresAt: connection.credentials.expiresAt,
    clientId: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientId,
    clientSecret: (provider as EngagementOauthProvider).config.oauth.credentials.oauthClientSecret,
  });
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://slack.com',
  tokenPath: '/api/oauth.v2.access',
  authorizeHost: 'https://slack.com',
  authorizePath: '/oauth/v2/authorize',
};
