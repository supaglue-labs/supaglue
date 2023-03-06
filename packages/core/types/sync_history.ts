import { Connection } from './connection';

export type SyncHistoryStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type SyncHistory = {
  id: number;
  model: string;
  status: SyncHistoryStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
  connection: Pick<Connection, 'id' | 'category' | 'providerName' | 'status' | 'customerId'>;
};

export type SyncHistoryCreateParams = Omit<SyncHistory, 'id' | 'connection'>;
