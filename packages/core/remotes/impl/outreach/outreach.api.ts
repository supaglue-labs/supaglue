import createClient from 'openapi-fetch';

import type { paths } from './outreach.openapi.gen';

interface OutreachCredentials {
  accessToken: string;

  // Comment back in when we are refreshing tokens in the client itself instead
  // refreshToken: string;
  // expiresAt: string | null; // ISO string
  // clientId: string;
  // clientSecret: string;
}

export type OutreachApi = ReturnType<typeof createOutreachApi>;
export function createOutreachApi(creds: OutreachCredentials) {
  return createClient<paths>({
    // TODO: Get this from the openapi spec if possible
    baseUrl: 'https://api.outreach.io/api/v2',
    headers: {
      // We use a getter here here to interoperate with maybeRefreshAccessToken
      get Authorization() {
        return `Bearer ${creds.accessToken}`;
      },
    },
  });
}
