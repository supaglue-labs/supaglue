import type { Connection as ConnectionModel } from '@supaglue/db';
import { ConnectionSafeAny, ConnectionStatus, ConnectionUnsafeAny, CRMProviderName } from '@supaglue/types';
import { decrypt } from '../lib/crypt';
import { parseCustomerIdPk } from '../lib/customer_id';

export const fromConnectionModelToConnectionUnsafe = async ({
  id,
  customerId,
  category,
  integrationId,
  providerName,
  status,
  credentials,
  instanceUrl,
}: ConnectionModel): Promise<ConnectionUnsafeAny> => {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    integrationId,
    category: category as 'crm',
    status: status as ConnectionStatus,
    providerName: providerName as CRMProviderName,
    credentials: JSON.parse(await decrypt(credentials)),
    instanceUrl,
  };
};

export const fromConnectionModelToConnectionSafe = ({
  id,
  customerId,
  category,
  integrationId,
  providerName,
  status,
  instanceUrl,
}: ConnectionModel): ConnectionSafeAny => {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    integrationId,
    category: category as 'crm',
    status: status as ConnectionStatus,
    providerName: providerName as CRMProviderName,
    instanceUrl,
  };
};
