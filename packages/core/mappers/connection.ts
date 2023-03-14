import type { Connection as ConnectionModel } from '@supaglue/db';
import { decrypt } from '../lib/crypt';
import { ConnectionSafe, ConnectionStatus, ConnectionUnsafe, CRMConnectionUnsafe } from '../types';

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
    category,
    status: status as ConnectionStatus,
    providerName,
    credentials: JSON.parse(decrypt(credentials)),
  } as CRMConnectionUnsafe;
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
    category,
    status: status as ConnectionStatus,
    providerName,
  } as ConnectionSafe;
};
