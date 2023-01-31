export type SyncRunStatus = 'success' | 'error' | 'running';

export type SyncRun = {
  id: string;
  syncId: string;
  result: SyncRunResult;
  startTimestamp: Date;
};

export type SyncRunResult = SuccessResult | RunningResult | ErrorResult;

export type SuccessResult = {
  status: 'success';
  finishTimestamp: Date;
};

export type RunningResult = {
  status: 'running';
};

export type ErrorResult = {
  status: 'error';
  errorMessage: string;
};
