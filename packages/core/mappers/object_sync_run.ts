import type { ObjectType } from '@supaglue/types/object_sync';
import type { ObjectSyncRun, ObjectSyncRunStatus, ObjectSyncRunWithObject } from '@supaglue/types/object_sync_run';
import { parseCustomerIdPk } from '../lib/customer_id';
import type { ObjectSyncRunModelExpanded, ObjectSyncRunModelExpandedWithObject } from '../types/object_sync_run';

export const fromObjectSyncRunModelAndSync = (args: ObjectSyncRunModelExpanded): ObjectSyncRun => {
  const { id, status, errorMessage, startTimestamp, endTimestamp, objectSync, numRecordsSynced } = args;
  const { connection } = objectSync;
  const { applicationId, externalCustomerId } = parseCustomerIdPk(connection.customerId);
  return {
    id,
    objectSyncId: objectSync.id,
    status: status as ObjectSyncRunStatus,
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
  args: ObjectSyncRunModelExpandedWithObject
): ObjectSyncRunWithObject => {
  return {
    ...fromObjectSyncRunModelAndSync(args),
    objectType: args.objectSync.objectType as ObjectType,
    object: args.objectSync.object as string, // TODO: later, when we actually deal with entity syncs, we need to fix this
  };
};
