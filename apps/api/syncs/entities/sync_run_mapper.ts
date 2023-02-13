import { SyncRun as SyncRunModel } from '@prisma/client';
import { Sync } from '@supaglue/types';
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

export const fromModelToSyncRunWithSyncData = (
  model: SyncRunModel & { sync: Partial<Sync> }
): SyncRun & { sync: Partial<Sync> } => {
  const { id, syncId, startTimestamp, sync } = model;

  return {
    id,
    syncId,
    startTimestamp,
    result: fromModelToSyncRunResult(model),
    sync,
  };
};

const fromModelToSyncRunResult = ({ status, errorMessage, finishTimestamp }: SyncRunModel): SyncRunResult => {
  switch (status) {
    case 'running':
      return { status };
    case 'error':
      return {
        status,
        errorMessage,
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
