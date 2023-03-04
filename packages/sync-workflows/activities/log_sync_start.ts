import { SyncHistoryService } from '@supaglue/core/services';

export function createLogSyncStart({ syncHistoryService }: { syncHistoryService: SyncHistoryService }) {
  return async function logSyncStart({ connectionId, commonModel }: { connectionId: string; commonModel: string }) {
    const { id: historyId } = await syncHistoryService.create({
      connectionId,
      createParams: {
        model: commonModel,
        status: 'IN_PROGRESS',
        errorMessage: null,
        startTimestamp: new Date(),
        endTimestamp: null,
      },
    });

    return historyId;
  };
}
