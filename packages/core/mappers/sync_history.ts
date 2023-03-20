import { SyncHistory, SyncHistoryModelExpanded, SyncHistoryStatus } from '../types';

export const fromSyncHistoryModelAndConnection = ({
  id,
  model,
  status,
  errorMessage,
  startTimestamp,
  endTimestamp,
  connection,
}: SyncHistoryModelExpanded): SyncHistory => {
  return {
    id,
    model,
    status: status as SyncHistoryStatus,
    errorMessage,
    startTimestamp,
    endTimestamp,
    connectionId: connection.id,
    customerId: connection.customerId,
    providerName: connection.providerName,
    category: connection.category,
  };
};
