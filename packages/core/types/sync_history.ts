import { Connection } from './connection';

export type SyncHistoryStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type SyncHistory = {
  id: number;
  model: string;
  status: SyncHistoryStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  connection: Connection;
};

export type SyncHistoryCreateParams = Omit<SyncHistory, 'id' | 'connection'>;
