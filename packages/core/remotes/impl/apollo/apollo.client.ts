import { createOpenapiClient } from '../../utils/createOpenapiClient';

import type { paths } from './apollo.openapi.gen';

interface ApolloCredentials {
  apiKey: string;
}

export type ApolloClient = ReturnType<typeof createApolloClient>;
export function createApolloClient(creds: ApolloCredentials) {
  return createOpenapiClient<paths>({
    baseUrl: 'https://app.apollo.io/api',
    preRequest(input, init) {
      if (input && init?.method?.toLowerCase() === 'get') {
        const url = new URL(input);
        url.searchParams.set('api_key', creds.apiKey);
        return [url.toString(), init];
      }
      try {
        return [
          input,
          { ...init, body: JSON.stringify({ api_key: creds.apiKey, ...JSON.parse(init?.body as string) }) },
        ];
      } catch {
        return [input, init];
      }
    },
  });
}
