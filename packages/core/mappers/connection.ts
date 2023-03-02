import type { Connection as ConnectionModel } from '@supaglue/db';
import { Connection, ConnectionCredentials, ConnectionStatus, CRMConnection } from '../types';

export const fromConnectionModel = ({
  id,
  customerId,
  category,
  integrationId,
  providerName,
  status,
  credentials,
}: ConnectionModel): Connection => {
  return {
    id,
    customerId,
    integrationId,
    category,
    status: status as ConnectionStatus,
    providerName,
    credentials: credentials as ConnectionCredentials,
  } as CRMConnection;
};
