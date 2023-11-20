import { createOpenapiClient } from '@supaglue/schemas';

import type { paths } from './apollo.openapi.gen';
import oas from './apollo.openapi.json';

interface ApolloCredentials {
  apiKey: string;
}

export type ApolloClient = ReturnType<typeof createApolloClient>;
export function createApolloClient(creds: ApolloCredentials) {
  return createOpenapiClient<paths>({
    baseUrl: oas.servers[0].url,
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
