import { SyncRun as SyncRunModel } from '@prisma/client';
import { ErrorResult, SuccessResult, SyncRun, SyncRunResult } from '.';

export const fromModelToSyncRun = (model: SyncRunModel): SyncRun => {
  const { id, syncId, startTimestamp } = model;
  return {
    id,
    syncId,
    startTimestamp,
    result: fromModelToSyncRunResult(model),
  };
};

const fromModelToSyncRunResult = ({ status, errorMessage, finishTimestamp }: SyncRunModel): SyncRunResult => {
  switch (status) {
    case 'running':
      return { status };
    case 'error':
      return {
        status,
        errorMessage: errorMessage ?? 'An error has occurred',
      } as ErrorResult;
    case 'success':
      return {
        status,
        finishTimestamp,
      } as SuccessResult;
    default:
      throw new Error('Unrecognized result');
  }
};
