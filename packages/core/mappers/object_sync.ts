import type { Connection as ConnectionModel, ObjectSync as ObjectSyncModel } from '@supaglue/db';
import type {
  ObjectSync,
  ObjectSyncDTO,
  ObjectSyncState,
  ObjectSyncType,
  ObjectType,
} from '@supaglue/types/object_sync';
import { parseCustomerIdPk } from '../lib';

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

export const fromObjectSyncModelWithConnection = (
  model: ObjectSyncModel & { connection: ConnectionModel }
): ObjectSyncDTO => {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type, ...otherStrategyProps } = model.strategy as { type: ObjectSyncType } & Record<string, unknown>;

  const { connection } = model;
  const { externalCustomerId } = parseCustomerIdPk(connection.customerId);

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    providerName: connection.providerName,
    customerId: externalCustomerId,
    objectType: model.objectType as ObjectType,
    object: model.object,
    type,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as ObjectSyncState,
    paused: model.paused,
    argsForNextRun: model.argsForNextRun,
  } as ObjectSyncDTO;
};
