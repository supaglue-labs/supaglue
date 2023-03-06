export type SyncHistoryStatus = 'SUCCESS' | 'FAILURE' | 'IN_PROGRESS';

export type SyncHistory = {
  id: number;
  model: string;
  status: SyncHistoryStatus;
  errorMessage: string | null;
  startTimestamp: Date;
  endTimestamp: Date | null;
};

export type SyncHistoryCreateParams = Omit<SyncHistory, 'id'>;
