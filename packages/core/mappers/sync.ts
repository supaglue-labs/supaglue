import type { Connection as ConnectionModel, Sync as SyncModel } from '@supaglue/db';
import type { ArgsForNextSyncRun, ObjectType, Sync, SyncDTO, SyncState, SyncStrategyType } from '@supaglue/types/sync';
import { parseCustomerIdPk } from '../lib';

export const fromSyncModel = (model: SyncModel): Sync => {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type: strategyType, ...otherStrategyProps } = model.strategy as { type: SyncStrategyType } & Record<
    string,
    unknown
  >;

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    objectType: model.objectType as ObjectType,
    object: model.object,
    strategyType,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as SyncState,
    paused: model.paused,
    argsForNextRun: model.argsForNextRun,
  } as Sync;
};

export const fromSyncModelWithConnection = (model: SyncModel & { connection: ConnectionModel }): SyncDTO => {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type: strategyType, ...otherStrategyProps } = model.strategy as { type: SyncStrategyType } & Record<
    string,
    unknown
  >;

  const { connection } = model;
  const { externalCustomerId } = parseCustomerIdPk(connection.customerId);

  const base = {
    id: model.id,
    connectionId: model.connectionId,
    providerName: connection.providerName,
    customerId: externalCustomerId,
    strategyType,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as SyncState,
    paused: model.paused,
    argsForNextRun: model.argsForNextRun as ArgsForNextSyncRun | null,
  };

  // TODO: don't do type assertion
  if (model.type === 'object') {
    return {
      ...base,
      type: 'object',
      objectType: model.objectType as ObjectType,
      object: model.object as string,
    } as SyncDTO;
  }

  if (model.type === 'entity') {
    return {
      ...base,
      type: 'entity',
      entityId: model.entityId as string,
    } as SyncDTO;
  }
};
