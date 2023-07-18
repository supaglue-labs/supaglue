import type { ConnectionUnsafe, Provider } from '@supaglue/types';
import type { ConnectorAuthConfig } from '../../base';
import { AbstractEngagementRemoteClient } from '../../categories/engagement/base';

class ApolloClient extends AbstractEngagementRemoteClient {
  public constructor() {
    super('missing-base-url');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'apollo'>, provider: Provider): ApolloClient {
  return new ApolloClient();
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: '',
  tokenPath: '',
  authorizeHost: '',
  authorizePath: '',
};
