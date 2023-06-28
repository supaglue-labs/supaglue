import { ConnectionUnsafe, CRMProvider } from '@supaglue/types';
import { CRMCommonModelType, CRMCommonModelTypeMap } from '@supaglue/types/crm';
import { FieldMappingConfig } from '@supaglue/types/field_mapping_config';
import { Readable } from 'stream';
import { AbstractCrmRemoteClient, ConnectorAuthConfig } from '../base';

class ZohoCrmClient extends AbstractCrmRemoteClient {
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
    id: string,
    fieldMappingConfig: FieldMappingConfig
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

export function newClient(connection: ConnectionUnsafe<'zoho_crm'>, provider: CRMProvider): ZohoCrmClient {
  return new ZohoCrmClient();
}

// TODO: support other geographies
export const authConfig: ConnectorAuthConfig = {
  tokenHost: 'https://accounts.zoho.com',
  tokenPath: '/oauth/v2/token',
  authorizeHost: 'https://accounts.zoho.com',
  authorizePath: '/oauth/v2/auth',
};
