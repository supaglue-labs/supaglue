import type { Connection as ConnectionModel, EntitySync as EntitySyncModel } from '@supaglue/db';
import type { EntitySync, EntitySyncDTO, EntitySyncState, EntitySyncType } from '@supaglue/types/entity_sync';
import { parseCustomerIdPk } from '../lib';

export const fromEntitySyncModel = (model: EntitySyncModel): EntitySync => {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type, ...otherStrategyProps } = model.strategy as { type: EntitySyncType } & Record<string, unknown>;

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    entityId: model.entityId,
    type,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as EntitySyncState,
    paused: model.paused,
    argsForNextRun: model.argsForNextRun,
  } as EntitySync;
};

export const fromEntitySyncModelWithConnection = (
  model: EntitySyncModel & { connection: ConnectionModel }
): EntitySyncDTO => {
  // `strategy` looks like { type: 'full then incremental', ...otherProps }

  const { type, ...otherStrategyProps } = model.strategy as { type: EntitySyncType } & Record<string, unknown>;

  const { connection } = model;
  const { externalCustomerId } = parseCustomerIdPk(connection.customerId);

  // TODO: don't do type assertion
  return {
    id: model.id,
    connectionId: model.connectionId,
    providerName: connection.providerName,
    customerId: externalCustomerId,
    entityId: model.entityId,
    type,
    syncConfigId: model.syncConfigId,
    ...otherStrategyProps,
    state: model.state as EntitySyncState,
    paused: model.paused,
    argsForNextRun: model.argsForNextRun,
  } as EntitySyncDTO;
};
