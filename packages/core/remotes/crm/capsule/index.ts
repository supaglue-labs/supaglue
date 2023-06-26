import { ConnectionUnsafe, CRMProvider } from '@supaglue/types';
import { CRMCommonModelType, CRMCommonModelTypeMap } from '@supaglue/types/crm';
import { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { Readable } from 'stream';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';

class CapsuleClient extends AbstractCrmRemoteClient {
  public constructor() {
    // TODO: Support baseUrl
    super('missing-base-url');
  }

  protected override getAuthHeadersForPassthroughRequest(): Record<string, string> {
    throw new Error('Not implemented');
  }

  public override listCommonObjectRecords(
    commonModelType: CRMCommonModelType,
    fieldMappingConfig: FieldMappingConfig,
    updatedAfter?: Date
  ): Promise<Readable> {
    throw new Error('Not implemented');
  }

  public override getCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    id: string
  ): Promise<CRMCommonModelTypeMap<T>['object']> {
    throw new Error('Not implemented');
  }

  public override createCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['createParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }

  public override updateCommonObjectRecord<T extends CRMCommonModelType>(
    commonModelType: T,
    params: CRMCommonModelTypeMap<T>['updateParams']
  ): Promise<string> {
    throw new Error('Not implemented');
  }
}

export function newClient(connection: ConnectionUnsafe<'capsule'>, provider: CRMProvider): CapsuleClient {
  return new CapsuleClient();
}

export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://api.capsulecrm.com',
  tokenPath: '/oauth/token',
  authorizeHost: 'https://api.capsulecrm.com',
  authorizePath: '/oauth/authorise',
};
