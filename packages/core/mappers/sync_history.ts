import { parseCustomerIdPk } from '../lib/customer_id';
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
  const { applicationId, externalCustomerId } = parseCustomerIdPk(connection.customerId);
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
