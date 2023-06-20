import type { Prisma, SyncConfig as SyncConfigModel } from '@supaglue/db';
import { SyncConfig, SyncConfigCreateParams, SyncConfigData } from '@supaglue/types';

export const fromSyncConfigModel = ({
  id,
  applicationId,
  destinationId,
  providerId,
  config,
}: SyncConfigModel): SyncConfig => {
  return {
    id,
    applicationId,
    providerId,
    destinationId,
    config: fromSyncConfigDataModel(config),
  } as SyncConfig; // TODO: better type;
};

const fromSyncConfigDataModel = (config: Prisma.JsonValue): SyncConfigData => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('SyncConfig config is missing');
  }
  const configToReturn = config as unknown as SyncConfigData;
  return {
    ...configToReturn,
    rawObjects: configToReturn.rawObjects?.map((rawObject) => ({
      ...rawObject,
      // TODO: do a proper migration later to ensure that schema is always set
      schema: rawObject.schema ?? { type: 'inherited' },
    })),
  };
};

export const toSyncConfigModel = async ({
  applicationId,
  destinationId,
  providerId,
  config,
}: SyncConfigCreateParams) => {
  return {
    applicationId,
    destinationId,
    providerId,
    config,
  };
};
