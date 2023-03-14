import type { Connection as ConnectionModel } from '@supaglue/db';
import { decrypt } from '../lib/crypt';
import { ConnectionSafe, ConnectionStatus, ConnectionUnsafe, CRMProviderName } from '../types';

export const fromConnectionModelToConnectionUnsafe = ({
  id,
  customerId,
  category,
  integrationId,
  providerName,
  status,
  credentials,
}: ConnectionModel): ConnectionUnsafe => {
  return {
    id,
    customerId,
    integrationId,
    category: category as 'crm',
    status: status as ConnectionStatus,
    providerName: providerName as CRMProviderName,
    credentials: JSON.parse(decrypt(credentials)),
  };
};

export const fromConnectionModelToConnectionSafe = ({
  id,
  customerId,
  category,
  integrationId,
  providerName,
  status,
}: ConnectionModel): ConnectionSafe => {
  return {
    id,
    customerId,
    integrationId,
    category: category as 'crm',
    status: status as ConnectionStatus,
    providerName: providerName as CRMProviderName,
  };
};
