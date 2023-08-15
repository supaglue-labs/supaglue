import type { Connection as ConnectionModel } from '@supaglue/db';
import type {
  CategoryOfProviderName,
  ConnectionSafeAny,
  ConnectionUnsafe,
  ProviderName,
  SchemaMappingsConfig,
} from '@supaglue/types';
import type { ConnectionEntityMapping } from '@supaglue/types/entity_mapping';
import { decrypt } from '../lib/crypt';
import { parseCustomerIdPk } from '../lib/customer_id';

export async function fromConnectionModelToConnectionUnsafe<T extends ProviderName>({
  id,
  customerId,
  category,
  providerId,
  providerName,
  credentials,
  schemaMappingsConfig,
  entityMappings,
  instanceUrl,
}: ConnectionModel): Promise<ConnectionUnsafe<T>> {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    providerId: providerId ?? undefined,
    category: category as CategoryOfProviderName<T>,
    providerName: providerName as T,
    credentials: JSON.parse(await decrypt(credentials)),
    schemaMappingsConfig: schemaMappingsConfig as SchemaMappingsConfig | undefined,
    entityMappings: entityMappings as ConnectionEntityMapping[] | undefined,
    instanceUrl,
  };
}

export function fromConnectionModelToConnectionSafe({
  id,
  customerId,
  category,
  providerId,
  providerName,
  schemaMappingsConfig,
  entityMappings,
  instanceUrl,
}: ConnectionModel): ConnectionSafeAny {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    providerId: providerId ?? undefined,
    category: category as 'crm',
    providerName: providerName as ProviderName,
    schemaMappingsConfig: schemaMappingsConfig as SchemaMappingsConfig | undefined,
    entityMappings: entityMappings as ConnectionEntityMapping[] | undefined,
    instanceUrl,
  };
}
