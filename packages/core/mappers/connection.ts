import type { Connection as ConnectionModel } from '@supaglue/db';
import { ConnectionSafeAny, ConnectionStatus, ConnectionUnsafe, CRMProviderName } from '@supaglue/types';
import { decrypt } from '../lib/crypt';
import { parseCustomerIdPk } from '../lib/customer_id';

export async function fromConnectionModelToConnectionUnsafe<T extends CRMProviderName>({
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
    category: category as 'crm',
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
