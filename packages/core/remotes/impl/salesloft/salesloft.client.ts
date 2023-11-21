import type { ConnectorAuthConfig } from '../../base';
import type { OAuthClientOptions } from '../../utils/createOpenapiClient';
import { createOpenapiOauthClient } from '../../utils/createOpenapiClient';

import type { paths } from './salesloft.openapi.gen';
import oas from './salesloft.openapi.json';

interface SalesloftCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null;
  clientId: string;
  clientSecret: string;
}

export type SalesloftClient = ReturnType<typeof createSalesloftClient>;
export function createSalesloftClient({
  credentials: creds,
  ...options
}: { credentials: SalesloftCredentials } & Pick<OAuthClientOptions, 'onTokenRefreshed'>) {
  return createOpenapiOauthClient<paths>({
    baseUrl: oas.servers[0].url,
    ...options,
    tokens: creds,
    refreshTokens: async (request) =>
      request<{ refresh_token: string; access_token: string; expires_in: number }>(
        'POST',
        `${salesloftAuthConfig.tokenHost}${salesloftAuthConfig.tokenPath}`,
        {
          fetch: globalThis.fetch, // Avoid loops
          body: {
            client_id: creds.clientId,
            client_secret: creds.clientSecret,
            grant_type: 'refresh_token',
            refresh_token: creds.refreshToken,
          },
        }
      ).then((res) => ({
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
        expiresAt: new Date(Date.now() + res.data.expires_in * 1000).toISOString(),
      })),
  });
}

export const salesloftAuthConfig: ConnectorAuthConfig = {
  tokenHost: 'https://accounts.salesloft.com',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://accounts.salesloft.com',
  authorizePath: '/oauth/authorize',
};
