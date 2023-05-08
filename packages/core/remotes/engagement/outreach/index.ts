import { ConnectionUnsafe, Integration } from '@supaglue/types';
import { EngagementCommonModelType, EngagementCommonModelTypeMap } from '@supaglue/types/engagement';
import { Readable } from 'stream';
import { AbstractEngagementRemoteClient, ConnectorAuthConfig } from '../base';

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
  }

  public override listObjects(commonModelType: EngagementCommonModelType, updatedAfter?: Date): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public override createObject<T extends EngagementCommonModelType>(
    commonModelType: T,
    params: EngagementCommonModelTypeMap<T>['createParams']
  ): Promise<EngagementCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'outreach'>, integration: Integration): OutreachClient {
  return new OutreachClient(connection.credentials);
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.outreach.io',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://api.outreach.io',
  authorizePath: '/oauth/authorize',
};
