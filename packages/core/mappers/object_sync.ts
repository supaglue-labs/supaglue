import type { ObjectSync as ObjectSyncModel } from '@supaglue/db';
import type { ObjectSync, ObjectSyncState, ObjectSyncType, ObjectType } from '@supaglue/types/object_sync';

export const fromObjectSyncModel = (model: ObjectSyncModel): ObjectSync => {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type, ...otherStrategyProps } = model.strategy as { type: ObjectSyncType } & Record<string, unknown>;

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    objectType: model.objectType as ObjectType,
    object: model.object,
    type,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as ObjectSyncState,
    paused: model.paused,
    argsForNextRun: model.argsForNextRun,
  } as ObjectSync;
};
