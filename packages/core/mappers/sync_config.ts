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
  return config as unknown as SyncConfigData;
};

export const toSyncConfigModel = ({ applicationId, destinationId, providerId, config }: SyncConfigCreateParams) => {
  return {
    applicationId,
    destinationId,
    providerId,
    config,
  };
};
