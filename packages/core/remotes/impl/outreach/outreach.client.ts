import { SGConnectionNoLongerAuthenticatedError } from '../../../errors';
import { createOpenapiClient, HTTPError } from '../../utils/createOpenapiClient';

import type { paths } from './outreach.openapi.gen';

interface OutreachCredentials {
  accessToken: string;

  // Comment back in when we are refreshing tokens in the client itself instead
  refreshToken: string;
  expiresAt: string | null; // ISO string
  clientId: string;
  clientSecret: string;
}

export const REFRESH_TOKEN_THRESHOLD_MS = 300000; // 5 minutes

export type OutreachClient = ReturnType<typeof createOutreachClient>;
export function createOutreachClient({
  onTokenRefreshed,
  ...creds
}: OutreachCredentials & {
  onTokenRefreshed?: (creds: Pick<OutreachCredentials, 'accessToken' | 'refreshToken' | 'expiresAt'>) => void;
}) {
  // Maybe worth modifying the outreach openapi spec with refresh token tools
  const client = createOpenapiClient<paths>({
    baseUrl: 'https://api.outreach.io/api/v2',
    async preRequest(input, init) {
      // Proactive refresh access token
      if (!creds.expiresAt || Date.parse(creds.expiresAt) < Date.now() + REFRESH_TOKEN_THRESHOLD_MS) {
        await refreshAccessToken();
      }
      return [input, { ...init, headers: { ...init?.headers, Authorization: `Bearer ${creds.accessToken}` } }];
    },
    // Maybe implement reactive refresh also based on http 403
  });

  async function refreshAccessToken() {
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
      creds.accessToken = res.data.access_token;
      creds.refreshToken = res.data.refresh_token;
      creds.expiresAt = new Date(Date.now() + res.data.expires_in * 1000).toISOString();
      onTokenRefreshed?.(creds);
    } catch (e) {
      if (e instanceof HTTPError && e.response.status === 400) {
        throw new SGConnectionNoLongerAuthenticatedError('Unable to refresh access token. Refresh token invalid.');
      }
      throw e;
    }
  }
  return client;
}
