import type { Connection as ConnectionModel } from '@supaglue/db';
import { ConnectionSafe, ConnectionStatus, ConnectionUnsafe, CRMProviderName } from '@supaglue/types';
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
  remoteId,
}: ConnectionModel): Promise<ConnectionUnsafe> => {
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
    remoteId,
  };
};

export const fromConnectionModelToConnectionSafe = ({
  id,
  customerId,
  category,
  integrationId,
  providerName,
  status,
  remoteId,
}: ConnectionModel): ConnectionSafe => {
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
  };
};
