import { ConnectionUnsafe, Integration } from '@supaglue/types';
import {
  EngagementCommonModelType,
  EngagementCommonModelTypeMap,
  SequenceStartParams,
} from '@supaglue/types/engagement';
import { AbstractEngagementRemoteClient, ConnectorAuthConfig } from '../base';

<<<<<<< HEAD
type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
};

class OutreachClient extends AbstractEngagementRemoteClient {
  readonly #credentials: Credentials;
  public constructor(credentials: Credentials) {
    super('https://api.outreach.io');
    this.#credentials = credentials;
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#credentials.accessToken}`,
    };
=======
class OutreachClient extends AbstractEngagementRemoteClient {
  public constructor() {
    // TODO: Support baseUrl
    super('missing-base-url');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
>>>>>>> 2d64d5f5cf95da1c98c8fc072d71886bb1a03946
  }

  public override createObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<EngagementCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }

  public override startSequence(params: SequenceStartParams): Promise<void> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'outreach'>, integration: Integration): OutreachClient {
<<<<<<< HEAD
  return new OutreachClient(connection.credentials);
=======
  return new OutreachClient();
>>>>>>> 2d64d5f5cf95da1c98c8fc072d71886bb1a03946
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.outreach.io',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://api.outreach.io',
  authorizePath: '/oauth/authorize',
};
