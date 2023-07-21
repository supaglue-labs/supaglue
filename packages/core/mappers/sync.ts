import type { Connection as ConnectionModel, Sync as SyncModel } from '@supaglue/db';
import type { ObjectType, Sync, SyncDTO, SyncState, SyncStrategyType } from '@supaglue/types/sync';
import { parseCustomerIdPk } from '../lib';

export const fromSyncModel = (model: SyncModel): Sync => {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type: strategyType, ...otherStrategyProps } = model.strategy as { type: SyncStrategyType } & Record<
    string,
    unknown
  >;

  // TODO: don't do type assertion
  const base = {
    id: model.id,
    connectionId: model.connectionId,
    strategyType,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as SyncState,
    paused: model.paused,
    argsForNextRun: model.argsForNextRun,
  };

  // TODO: don't do type assertion
  if (model.type === 'object') {
    return {
      ...base,
      type: 'object',
      objectType: model.objectType as ObjectType,
      object: model.object as string,
    } as Sync;
  }

  if (model.type === 'entity') {
    return {
      ...base,
      type: 'entity',
      entityId: model.entityId as string,
    } as Sync;
  }

  throw new Error('Unexpectedly corrupt sync');
};

export const fromSyncModelWithConnection = (model: SyncModel & { connection: ConnectionModel }): SyncDTO => {
  const sync = fromSyncModel(model);

  const { connection } = model;
  const { externalCustomerId } = parseCustomerIdPk(connection.customerId);

  return {
    ...sync,
    providerName: connection.providerName,
    customerId: externalCustomerId,
  };
};
