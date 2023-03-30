import { parseCustomerIdPk } from '../lib/customer_id';
import { SyncHistory, SyncHistoryModelExpanded, SyncHistoryStatus } from '../types';

export const fromSyncHistoryModelAndSync = ({
  id,
  model,
  status,
  errorMessage,
  startTimestamp,
  endTimestamp,
  sync,
}: SyncHistoryModelExpanded): SyncHistory => {
  const { connection } = sync;
  const { applicationId, externalCustomerId } = parseCustomerIdPk(connection.customerId);
  return {
    id,
    syncId: sync.id,
    modelName: model,
    status: status as SyncHistoryStatus,
    errorMessage,
    startTimestamp,
    endTimestamp,
    connectionId: connection.id,
    applicationId,
    customerId: externalCustomerId,
    providerName: connection.providerName,
    category: connection.category as 'crm',
  };
};
