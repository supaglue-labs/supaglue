import createClient from 'openapi-fetch';

import type { paths } from './apollo.openapi.gen';

interface ApolloCredentials {
  apiKey: string;
}

export type ApolloApi = ReturnType<typeof createApolloApi>;
export function createApolloApi(creds: ApolloCredentials) {
  return createClient<paths>({
    baseUrl: 'https://app.apollo.io/api',
    // TODO: Add middleware as this does not work at the moment
    body: JSON.stringify({
      api_key: creds.apiKey,
    }),
  });
}
