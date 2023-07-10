import type { Destination as DestinationModel } from '@supaglue/db';
import type { Destination } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils';

export const fromDestinationModel = (model: DestinationModel): Destination => {
  const config = model.config as any;
  return {
    id: model.id,
    name: model.name,
    type: model.type,
    applicationId: model.applicationId,
    config: model.type === 'bigquery' ? { ...config, credentials: camelcaseKeys(config.credentials) } : config,
  } as Destination; // TODO: better type safety?
};
