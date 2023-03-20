import { parseCustomerId } from '../lib/customerid';
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
  const { applicationId, externalCustomerId } = parseCustomerId(connection.customerId);
  return {
    id,
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
