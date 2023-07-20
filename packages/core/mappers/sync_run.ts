import type { ObjectType } from '@supaglue/types/sync';
import type { SyncRun, SyncRunStatus, SyncRunWithObjectOrEntity } from '@supaglue/types/sync_run';
import { parseCustomerIdPk } from '../lib/customer_id';
import type { SyncRunModelExpanded, SyncRunModelExpandedWithObjectAndEntity } from '../types/object_sync_run';

export const fromSyncRunModelAndSync = (args: SyncRunModelExpanded): SyncRun => {
  const { id, status, errorMessage, startTimestamp, endTimestamp, sync, numRecordsSynced } = args;
  const { connection } = sync;
  const { applicationId, externalCustomerId } = parseCustomerIdPk(connection.customerId);
  return {
    id,
    syncId: sync.id,
    status: status as SyncRunStatus,
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
};

export const fromObjectSyncRunModelAndSyncWithObject = (
  args: SyncRunModelExpandedWithObjectAndEntity
): SyncRunWithObjectOrEntity => {
  const base = fromSyncRunModelAndSync(args);

  if (args.sync.objectType !== null && args.sync.object !== null) {
    return {
      ...base,
      objectType: args.sync.objectType as ObjectType,
      object: args.sync.object as string,
    };
  }

  if (args.sync.entityId !== null) {
    return {
      ...base,
      entityId: args.sync.entityId,
    };
  }

  throw new Error('Unexpectedly corrupt sync run');
};
