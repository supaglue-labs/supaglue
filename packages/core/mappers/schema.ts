import type { Prisma, Schema as SchemaModel } from '@supaglue/db';
import type { Schema, SchemaConfig, SchemaCreateParams } from '@supaglue/types';

export const fromSchemaModel = async ({ id, applicationId, name, config }: SchemaModel): Promise<Schema> => {
  return {
    id,
    applicationId,
    name: name,
    config: fromSchemaConfigModel(config),
  };
};

const fromSchemaConfigModel = (config: Prisma.JsonValue): SchemaConfig => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Schema config is missing');
  }
  return config as SchemaConfig;
};

export const toSchemaModel = ({ applicationId, name, config }: SchemaCreateParams) => {
  return {
    applicationId,
    name,
    config,
  };
};
