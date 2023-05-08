import type { Connection as ConnectionModel } from '@supaglue/db';
import {
  CategoryOfProviderName,
  ConnectionSafeAny,
  ConnectionStatus,
  ConnectionUnsafe,
  ProviderName,
} from '@supaglue/types';
import { CRMProviderName } from '@supaglue/types/crm';
import { decrypt } from '../lib/crypt';
import { parseCustomerIdPk } from '../lib/customer_id';

export async function fromConnectionModelToConnectionUnsafe<T extends ProviderName>({
  id,
  customerId,
  category,
  integrationId,
  providerName,
  status,
  credentials,
  remoteId,
  instanceUrl,
}: ConnectionModel): Promise<ConnectionUnsafe<T>> {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    integrationId,
    category: category as CategoryOfProviderName<T>,
    status: status as ConnectionStatus,
    providerName: providerName as T,
    credentials: JSON.parse(await decrypt(credentials)),
    remoteId,
    instanceUrl,
  };
}

export function fromConnectionModelToConnectionSafe({
  id,
  customerId,
  category,
  integrationId,
  providerName,
  status,
  remoteId,
  instanceUrl,
}: ConnectionModel): ConnectionSafeAny {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    integrationId,
    category: category as 'crm',
    status: status as ConnectionStatus,
    providerName: providerName as CRMProviderName,
    remoteId,
    instanceUrl,
  };
}
