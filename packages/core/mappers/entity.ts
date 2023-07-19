import type { Entity as EntityModel, Prisma } from '@supaglue/db';
import type { Entity, EntityConfig, EntityCreateParams } from '@supaglue/types/entity';

export const fromEntityModel = async ({ id, applicationId, name, config }: EntityModel): Promise<Entity> => {
  return {
    id,
    applicationId,
    name: name,
    config: fromEntityConfigModel(config),
  };
};

const fromEntityConfigModel = (config: Prisma.JsonValue): EntityConfig => {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Entity config is missing');
  }
  return config as EntityConfig;
};

export const toEntityModel = ({ applicationId, name, config }: EntityCreateParams) => {
  return {
    applicationId,
    name,
    config,
  };
};
