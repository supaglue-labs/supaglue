import createClient from 'openapi-fetch';

import type { paths } from './salesloft.openapi.gen';

interface SalesloftCredentials {
  accessToken: string;
}

export type SalesloftApi = ReturnType<typeof createSalesloftApi>;
export function createSalesloftApi(creds: SalesloftCredentials) {
  return createClient<paths>({
    baseUrl: ' https://api.salesloft.com',
    headers: {
      // We use a getter here here to interoperate with maybeRefreshAccessToken
      get Authorization() {
        return `Bearer ${creds.accessToken}`;
      },
    },
  });
}
