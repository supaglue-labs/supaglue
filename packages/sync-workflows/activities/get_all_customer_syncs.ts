import type { ObjectSync } from '@supaglue/types/sync';
import type { SyncService } from '../services/sync_service';

export type GetAllRelatedCustomerSyncsArgs = {
  syncId: string;
  connectionId: string;
};

export type GetAllRelatedCustomerSyncsResult = {
  syncs: ObjectSync[];
};

export function createGetAllRelatedCustomerObjectSyncs(syncService: SyncService) {
  return async function getAllRelatedCustomerObjectSyncs({
    syncId,
    connectionId,
  }: GetAllRelatedCustomerSyncsArgs): Promise<GetAllRelatedCustomerSyncsResult> {
    const syncs = await syncService.getAllRelatedCustomerObjectSyncs(syncId, connectionId);
    return {
      syncs,
    };
  };
}
