import type { Destination as DestinationModel } from '@supaglue/db';
import type {
  BigQueryConfigUnsafe,
  DestinationSafeAny,
  DestinationUnsafeAny,
  PostgresConfigUnsafe,
  RedshiftConfigUnsafe,
  SnowflakeConfigUnsafe,
} from '@supaglue/types';
import { camelcaseKeys } from '@supaglue/utils';
import { decrypt } from '../lib/crypt';

export const fromDestinationModelToUnsafe = async (model: DestinationModel): Promise<DestinationUnsafeAny> => {
  const baseParams = {
    id: model.id,
    name: model.name,
    applicationId: model.applicationId,
    version: model.version,
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
    case 'snowflake':
      return {
        ...baseParams,
        type: 'snowflake',
        config: decryptedConfig,
      };
    case 'redshift':
      return {
        ...baseParams,
        type: 'redshift',
        config: decryptedConfig,
      };
    case 'postgres':
      return {
        ...baseParams,
        type: model.type,
        config: decryptedConfig,
      };
    case 'supaglue':
      return {
        id: model.id,
        applicationId: model.applicationId,
        type: model.type,
        version: 1,
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
    version: model.version,
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
    case 'snowflake': {
      const config = decryptedConfig as SnowflakeConfigUnsafe;
      const { password: _, ...safeConfig } = config;
      return {
        ...baseParams,
        type: 'snowflake',
        config: safeConfig,
      };
    }
    case 'redshift': {
      const config = decryptedConfig as RedshiftConfigUnsafe;
      const { s3AccessKey: _, ...safeConfig } = config;
      return {
        ...baseParams,
        type: 'redshift',
        config: safeConfig,
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
    case 'supaglue': {
      return {
        id: model.id,
        applicationId: model.applicationId,
        type: 'supaglue',
        version: 1,
      };
    }
    default:
      throw new Error(`Unknown destination type: ${model.type}`);
  }
};
