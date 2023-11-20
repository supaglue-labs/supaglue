import type { OAuthClientOptions } from '@supaglue/schemas';
import { createOpenapiOauthClient, HTTPError } from '@supaglue/schemas';
import { SGConnectionNoLongerAuthenticatedError } from '../../../errors';

import type { paths } from './outreach.openapi.gen';
import oas from './outreach.openapi.json';

interface OutreachCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null;
  clientId: string;
  clientSecret: string;
}

export type OutreachClient = ReturnType<typeof createOutreachClient>;
export function createOutreachClient({
  credentials: creds,
  ...options
}: { credentials: OutreachCredentials } & Pick<OAuthClientOptions, 'onTokenRefreshed'>) {
  // Maybe worth modifying the outreach openapi spec with refresh token tools
  return createOpenapiOauthClient<paths>({
    baseUrl: oas.servers[0].url,
    ...options,
    tokens: creds,
    refreshTokens: async (client) => {
      try {
        const res = await client.request<{ refresh_token: string; access_token: string; expires_in: number }>(
          'POST',
          '/oauth/token',
          {
            body: {
              client_id: creds.clientId,
              client_secret: creds.clientSecret,
              grant_type: 'refresh_token',
              refresh_token: creds.refreshToken,
            },
          }
        );
        return {
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
          expiresAt: new Date(Date.now() + res.data.expires_in * 1000).toISOString(),
        };
      } catch (e) {
        if (e instanceof HTTPError && e.response.status === 400) {
          throw new SGConnectionNoLongerAuthenticatedError('Unable to refresh access token. Refresh token invalid.');
        }
        throw e;
      }
    },
  });
}
