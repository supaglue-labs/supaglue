import type { Destination as DestinationModel } from '@supaglue/db';
import type { DestinationSafeAny, DestinationUnsafeAny, PostgresConfigUnsafe } from '@supaglue/types';
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
