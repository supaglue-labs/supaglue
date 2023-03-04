import type { Connection, SyncHistory as SyncHistoryModel } from '@supaglue/db';
import { SyncHistory, SyncHistoryStatus } from '../types';
import { fromConnectionModel } from './connection';

export const fromSyncHistoryModel = ({
  id,
  model,
  status,
  errorMessage,
  startTimestamp,
  endTimestamp,
  connection,
}: SyncHistoryModel & { connection: Connection }): SyncHistory => {
  return {
    id,
    model,
    status: status as SyncHistoryStatus,
    errorMessage,
    startTimestamp,
    endTimestamp,
    connection: fromConnectionModel(connection),
  };
};
