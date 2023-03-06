import type { SyncHistory as SyncHistoryModel } from '@supaglue/db';
import { SyncHistory, SyncHistoryStatus } from '../types';

export const fromSyncHistoryModel = ({
  id,
  model,
  status,
  errorMessage,
  startTimestamp,
  endTimestamp,
}: SyncHistoryModel): SyncHistory => {
  return {
    id,
    model,
    status: status as SyncHistoryStatus,
    errorMessage,
    startTimestamp,
    endTimestamp,
  };
};
