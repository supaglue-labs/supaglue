import type { Connection as ConnectionModel } from '@supaglue/db';
import {
  CategoryOfProviderName,
  ConnectionSafeAny,
  ConnectionSafeAnyWithIsSyncEnabled,
  ConnectionStatus,
  ConnectionUnsafe,
  ProviderName,
  SchemaMappingsConfig,
} from '@supaglue/types';
import { CRMProviderName } from '@supaglue/types/crm';
import { decrypt } from '../lib/crypt';
import { parseCustomerIdPk } from '../lib/customer_id';

export async function fromConnectionModelToConnectionUnsafe<T extends ProviderName>({
  id,
  customerId,
  category,
  providerId,
  providerName,
  status,
  credentials,
  schemaMappingsConfig,
  instanceUrl,
}: ConnectionModel): Promise<ConnectionUnsafe<T>> {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    providerId: providerId ?? undefined,
    category: category as CategoryOfProviderName<T>,
    status: status as ConnectionStatus,
    providerName: providerName as T,
    credentials: JSON.parse(await decrypt(credentials)),
    schemaMappingsConfig: schemaMappingsConfig as SchemaMappingsConfig | undefined,
    instanceUrl,
  };
}

export function fromConnectionModelToConnectionSafe({
  id,
  customerId,
  category,
  providerId,
  providerName,
  status,
  schemaMappingsConfig,
  instanceUrl,
}: ConnectionModel): ConnectionSafeAny {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    providerId: providerId ?? undefined,
    category: category as 'crm',
    status: status as ConnectionStatus,
    providerName: providerName as CRMProviderName,
    schemaMappingsConfig: schemaMappingsConfig as SchemaMappingsConfig | undefined,
    instanceUrl,
  };
}

export function fromConnectionModelWithSyncToConnectionSafeWithIsSyncEnabled(
  params: ConnectionModel & {
    sync: object | null;
  }
): ConnectionSafeAnyWithIsSyncEnabled {
  return {
    ...fromConnectionModelToConnectionSafe(params),
    isSyncEnabled: !!params.sync,
  };
}
