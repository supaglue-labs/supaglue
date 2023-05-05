import { ConnectionUnsafe, Integration } from '@supaglue/types';
import { EngagementCommonModelType, EngagementCommonModelTypeMap } from '@supaglue/types/engagement';
import axios from 'axios';
import { Readable } from 'stream';
import { AbstractEngagementRemoteClient, ConnectorAuthConfig } from '../base';

type Credentials = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string | null; // ISO string
};

class OutreachClient extends AbstractEngagementRemoteClient {
  readonly #credentials: Credentials;
  readonly #headers: Record<string, string>;
  public constructor(credentials: Credentials) {
    super('https://api.outreach.io');
    this.#credentials = credentials;
    this.#headers = { Authorization: `Bearer ${this.#credentials.accessToken}` };
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    return this.#headers;
  }

  public override async listObjects(
    commonModelType: EngagementCommonModelType,
    updatedAfter?: Date
  ): Promise<Readable> {
    return await this.listContacts(updatedAfter);
  }

  private async listContacts(updatedAfter?: Date): Promise<Readable> {
    const response = await axios.request({
      method: 'GET',
      baseURL: 'https://api.outreach.io', // TODO: Figure out why #baseUrl doesn't work
      url: '/api/v2/prospects',
      params: updatedAfter
        ? {
            'filter[updatedAt]': `${updatedAfter.toISOString()}..inf`,
          }
        : undefined,
      headers: this.#headers,
    });
    // eslint-disable-next-line no-console
    console.log(`response: `, response);
    return Readable.from([]);
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
