import type { Prisma, SyncConfig as SyncConfigModel } from '@supaglue/db';
import type { SyncConfig, SyncConfigData } from '@supaglue/types';

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

export const fromCreateParamsToSyncConfigModel = (
  { applicationId, config }: { applicationId: string; config: SyncConfigData },
  destinationId: string,
  providerId: string
) => {
  return {
    applicationId,
    destinationId,
    providerId,
    config,
  };
};
