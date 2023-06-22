import { SyncHistory, SyncHistoryStatus } from '@supaglue/types';
import { parseCustomerIdPk } from '../lib/customer_id';
import { SyncHistoryModelExpanded } from '../types';

export const fromSyncHistoryModelAndSync = (args: SyncHistoryModelExpanded): SyncHistory => {
  const { id, status, errorMessage, startTimestamp, endTimestamp, sync, numRecordsSynced } = args;
  const { connection } = sync;
  const { applicationId, externalCustomerId } = parseCustomerIdPk(connection.customerId);
  const base = {
    id,
    syncId: sync.id,
    status: status as SyncHistoryStatus,
    errorMessage,
    startTimestamp,
    endTimestamp,
    connectionId: connection.id,
    applicationId,
    customerId: externalCustomerId,
    providerName: connection.providerName,
    category: connection.category as 'crm',
    numRecordsSynced,
  };

  if (args.model) {
    return { ...base, modelName: args.model };
  }

  if (args.standardObject) {
    return { ...base, standardObject: args.standardObject };
  }

  if (args.customObject) {
    return { ...base, customObject: args.customObject };
  }

  // TODO: this should be an error, but we would need to do some DB cleanup
  return { ...base, modelName: '' };
};
