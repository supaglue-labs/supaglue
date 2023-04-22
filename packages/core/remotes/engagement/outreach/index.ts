import { ConnectionUnsafe, Integration } from '@supaglue/types';
import {
  EngagementCommonModelType,
  EngagementCommonModelTypeMap,
  SequenceStartParams,
} from '@supaglue/types/engagement';
import { AbstractEngagementRemoteClient, ConnectorAuthConfig } from '../base';

class OutreachClient extends AbstractEngagementRemoteClient {
  public constructor() {
    // TODO: Support baseUrl
    super('missing-base-url');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
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
  return new OutreachClient();
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'TBD',
  tokenPath: '/oauth/token',
  authorizeHost: 'TBD',
  authorizePath: '/oauth/authorize',
};
