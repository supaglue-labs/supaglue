import type { Connection as ConnectionModel } from '@supaglue/db';
import { ConnectionSafe, ConnectionStatus, ConnectionUnsafe, CRMProviderName } from '@supaglue/types';
import { decrypt } from '../lib/crypt';
import { parseCustomerIdPk } from '../lib/customer_id';

export const fromConnectionModelToConnectionUnsafe = ({
  id,
  customerId,
  category,
  integrationId,
  providerName,
  status,
  credentials,
  remoteId,
}: ConnectionModel): ConnectionUnsafe => {
  const { applicationId, externalCustomerId } = parseCustomerIdPk(customerId);
  return {
    id,
    applicationId,
    customerId: externalCustomerId,
    integrationId,
    category: category as 'crm',
    status: status as ConnectionStatus,
    providerName: providerName as CRMProviderName,
    credentials: JSON.parse(decrypt(credentials)),
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
