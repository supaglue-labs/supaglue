import type { Destination as DestinationModel } from '@supaglue/db';
import type { DestinationSafeAny, DestinationUnsafeAny } from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils';

export const fromDestinationModelToUnsafe = (model: DestinationModel): DestinationUnsafeAny => {
  const baseParams = {
    id: model.id,
    name: model.name,
    applicationId: model.applicationId,
  };

  const config = model.config as any;

  switch (model.type) {
    case 'bigquery':
      return {
        ...baseParams,
        type: 'bigquery',
        config: {
          ...config,
          credentials: camelcaseKeys(config.credentials),
        },
      };
    case 'postgres':
    case 's3':
      return {
        ...baseParams,
        type: model.type,
        config,
      };
    default:
      throw new Error(`Unknown destination type: ${model.type}`);
  }
};

// TODO: change this mapper to not return creds in safe path
// when we actually encrypt credentials
export const fromDestinationModelToSafe = (model: DestinationModel): DestinationSafeAny => {
  const baseParams = {
    id: model.id,
    name: model.name,
    applicationId: model.applicationId,
  };

  const config = model.config as any;

  switch (model.type) {
    case 'bigquery':
      return {
        ...baseParams,
        type: 'bigquery',
        config: {
          ...config,
          credentials: camelcaseKeys(config.credentials),
        },
      };
    case 'postgres':
    case 's3':
      return {
        ...baseParams,
        type: model.type,
        config,
      };
    default:
      throw new Error(`Unknown destination type: ${model.type}`);
  }
};
