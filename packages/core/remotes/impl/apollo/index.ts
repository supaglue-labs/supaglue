import type {
  ConnectionUnsafe,
  Provider,
  SendPassthroughRequestRequest,
  SendPassthroughRequestResponse,
} from '@supaglue/types';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';

class ApolloClient extends AbstractEngagementRemoteClient {
  #apiKey: string;

  public constructor(apiKey: string) {
    super('https://api.apollo.io');
    this.#apiKey = apiKey;
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {};
  }

  public override async sendPassthroughRequest(
    request: SendPassthroughRequestRequest
  ): Promise<SendPassthroughRequestResponse> {
    // Apollo requires the api key to be in the query string for GET requests, and in the body for POST/PATCH/PUT.
    // Note: This is not explicitly documented, but seems to be the convention for their API
    if (request.method === 'GET') {
      return await super.sendPassthroughRequest({ ...request, query: { ...request.query, api_key: this.#apiKey } });
    }
    if (request.method === 'POST' || request.method === 'PATCH' || request.method === 'PUT') {
      const bodyJson = request.body ? JSON.parse(request.body as string) : {};
      bodyJson['api_key'] = this.#apiKey;
      return await super.sendPassthroughRequest({ ...request, body: JSON.stringify(bodyJson) });
    }
    throw new Error(`Method ${request.method} not supported for the Apollo passthrough API`);
  }
}

export function newClient(connection: ConnectionUnsafe<'apollo'>, provider: Provider): ApolloClient {
  return new ApolloClient(connection.credentials.apiKey);
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: '',
  tokenPath: '',
  authorizeHost: '',
  authorizePath: '',
};
