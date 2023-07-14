import type { Destination as DestinationModel } from '@supaglue/db';
import type {
  BigQueryConfigUnsafe,
  DestinationSafeAny,
  DestinationUnsafeAny,
  PostgresConfigUnsafe,
  S3ConfigUnsafe,
} from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils';

// TODO: do decryption when we actually encrypt creds

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

export const fromDestinationModelToSafe = (model: DestinationModel): DestinationSafeAny => {
  const baseParams = {
    id: model.id,
    name: model.name,
    applicationId: model.applicationId,
  };

  switch (model.type) {
    case 'bigquery': {
      const config = camelcaseKeys(model.config as any) as BigQueryConfigUnsafe;
      return {
        ...baseParams,
        type: 'bigquery',
        config: {
          projectId: config.projectId,
          dataset: config.dataset,
          credentials: {
            clientEmail: config.credentials.clientEmail,
          },
        },
      };
    }
    case 'postgres': {
      const config = model.config as PostgresConfigUnsafe;
      return {
        ...baseParams,
        type: 'postgres',
        config: {
          host: config.host,
          port: config.port,
          database: config.database,
          schema: config.schema,
          user: config.user,
        },
      };
    }
    case 's3': {
      const config = model.config as S3ConfigUnsafe;
      return {
        ...baseParams,
        type: model.type,
        config: {
          region: config.region,
          bucket: config.bucket,
          accessKeyId: config.accessKeyId,
        },
      };
    }
    default:
      throw new Error(`Unknown destination type: ${model.type}`);
  }
};
