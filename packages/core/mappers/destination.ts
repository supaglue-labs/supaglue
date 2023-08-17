import type { Destination as DestinationModel } from '@supaglue/db';
import type {
  BigQueryConfigUnsafe,
  DestinationSafeAny,
  DestinationUnsafeAny,
  MongoDBConfigUnsafe,
  PostgresConfigUnsafe,
  S3ConfigUnsafe,
} from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils';
import { decrypt } from '../lib/crypt';

export const fromDestinationModelToUnsafe = async (model: DestinationModel): Promise<DestinationUnsafeAny> => {
  const baseParams = {
    id: model.id,
    name: model.name,
    applicationId: model.applicationId,
  };

  const decryptedConfig = JSON.parse(await decrypt(model.encryptedConfig));

  switch (model.type) {
    case 'bigquery':
      return {
        ...baseParams,
        type: 'bigquery',
        config: {
          ...decryptedConfig,
          credentials: camelcaseKeys(decryptedConfig.credentials),
        },
      };
    case 'postgres':
    case 's3':
    case 'mongodb':
      return {
        ...baseParams,
        type: model.type,
        config: decryptedConfig,
      };
    default:
      throw new Error(`Unknown destination type: ${model.type}`);
  }
};

export const fromDestinationModelToSafe = async (model: DestinationModel): Promise<DestinationSafeAny> => {
  const baseParams = {
    id: model.id,
    name: model.name,
    applicationId: model.applicationId,
  };

  const decryptedConfig = JSON.parse(await decrypt(model.encryptedConfig));

  switch (model.type) {
    case 'bigquery': {
      const config = camelcaseKeys(decryptedConfig) as BigQueryConfigUnsafe;
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
      const config = decryptedConfig as PostgresConfigUnsafe;
      return {
        ...baseParams,
        type: 'postgres',
        config: {
          host: config.host,
          port: config.port,
          database: config.database,
          schema: config.schema,
          user: config.user,
          sslMode: config.sslMode,
        },
      };
    }
    case 's3': {
      const config = decryptedConfig as S3ConfigUnsafe;
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
    case 'mongodb': {
      const config = decryptedConfig as MongoDBConfigUnsafe;
      return {
        ...baseParams,
        type: 'mongodb',
        config: {
          host: config.host,
          database: config.database,
          user: config.user,
        },
      };
    }
    default:
      throw new Error(`Unknown destination type: ${model.type}`);
  }
};
