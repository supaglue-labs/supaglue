import type { EntitySyncRun, EntitySyncRunStatus, EntitySyncRunWithEntity } from '@supaglue/types/entity_sync_run';
import { parseCustomerIdPk } from '../lib/customer_id';
import type { EntitySyncRunModelExpanded, EntitySyncRunModelExpandedWithEntity } from '../types/entity_sync_run';

export const fromEntitySyncRunModelAndSync = (args: EntitySyncRunModelExpanded): EntitySyncRun => {
  const { id, status, errorMessage, startTimestamp, endTimestamp, entitySync, numRecordsSynced } = args;
  const { connection } = entitySync;
  const { applicationId, externalCustomerId } = parseCustomerIdPk(connection.customerId);
  return {
    id,
    entitySyncId: entitySync.id,
    status: status as EntitySyncRunStatus,
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

export const fromEntitySyncRunModelAndSyncWithEntity = (
  args: EntitySyncRunModelExpandedWithEntity
): EntitySyncRunWithEntity => {
  return {
    ...fromEntitySyncRunModelAndSync(args),
    entityId: args.entitySync.entityId,
  };
};
