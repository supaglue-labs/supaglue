import type { PrismaClient } from '@supaglue/db';
import type {
  AddObjectToProviderParams,
  CommonObjectForCategory,
  CommonObjectType,
  OauthProvider,
  Provider,
  ProviderCategory,
  ProviderCreateParams,
  ProviderObjects,
  ProviderUpdateParams,
  SyncConfig,
} from '@supaglue/types';
import type { ObjectType } from '@supaglue/types/object_sync';
import { BadRequestError, NotFoundError } from '../errors';
import { fromProviderModel, fromSyncConfigModel, toProviderModel, toSchemaModel, toSyncConfigModel } from '../mappers';

export class ProviderService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getByIds(ids: string[]): Promise<Provider[]> {
    const providers = await this.#prisma.provider.findMany({
      where: { id: { in: ids } },
    });
    return Promise.all(providers.map((provider) => fromProviderModel(provider)));
  }

  public async getById<T extends Provider = Provider>(id: string): Promise<T> {
    const provider = await this.#prisma.provider.findUnique({
      where: { id },
    });
    if (!provider) {
      throw new NotFoundError(`Can't find provider with id: ${id}`);
    }
    return fromProviderModel<T>(provider);
  }

  public async getByIdAndApplicationId<T extends Provider = Provider>(id: string, applicationId: string): Promise<T> {
    const provider = await this.#prisma.provider.findUnique({
      where: { id },
    });
    if (!provider || provider.applicationId !== applicationId) {
      throw new NotFoundError(`Can't find provider with id: ${id}`);
    }

    return fromProviderModel<T>(provider);
  }

  public async getByNameAndApplicationId<T extends Provider = Provider>(
    name: string,
    applicationId: string
  ): Promise<T> {
    const provider = await this.#prisma.provider.findUnique({
      where: {
        applicationId_name: {
          applicationId,
          name,
        },
      },
    });
    if (!provider) {
      throw new NotFoundError(`Provider not found for name: ${name}`);
    }
    return fromProviderModel<T>(provider);
  }

  public async list(applicationId: string): Promise<Provider[]> {
    const providers = await this.#prisma.provider.findMany({ where: { applicationId } });
    return Promise.all(providers.map((provider) => fromProviderModel(provider)));
  }

  public validateProvider(provider: ProviderUpdateParams): void {
    if (provider.name !== 'apollo' && !(provider as OauthProvider).config?.oauth) {
      throw new BadRequestError(`OAuth config is required for provider: ${provider.name}`);
    }
    if (provider.name === 'apollo' && provider.authType !== 'api_key') {
      throw new BadRequestError(`Provider: ${provider.name} must be of type: api_key`);
    }
    if (provider.name !== 'apollo' && provider.authType !== 'oauth2') {
      throw new BadRequestError(`Provider: ${provider.name} must be of type: oauth2`);
    }
  }

  public async create<T extends Provider = Provider>(provider: ProviderCreateParams): Promise<T> {
    if (provider.objects) {
      validateObjects(provider.objects);
    }

    const createdProvider = await this.#prisma.provider.create({
      data: await toProviderModel(provider),
    });
    return fromProviderModel<T>(createdProvider);
  }

  public async addObject(
    providerId: string,
    applicationId: string,
    params: AddObjectToProviderParams
  ): Promise<Provider> {
    if (params.schemaId && params.schema) {
      throw new BadRequestError('You can only provide a schemaId or a schema, not both');
    }
    const provider = await this.getByIdAndApplicationId(providerId, applicationId);
    const model = await this.#prisma.$transaction(async (prisma) => {
      let { schemaId } = params;
      if (params.schema) {
        const schema = await prisma.schema.create({
          data: toSchemaModel({ applicationId, ...params.schema }),
        });
        schemaId = schema.id;
      }
      const objects = provider.objects ?? {};
      const model = await prisma.provider.update({
        where: { id: providerId },
        data: {
          objects: addObjectToProviderObjects(objects, params.name, params.type, schemaId),
        },
      });
      if (params.enableSync) {
        const syncConfigModel = await prisma.syncConfig.findUnique({
          where: {
            providerId,
          },
        });
        if (!syncConfigModel) {
          throw new BadRequestError(
            `Can't enable sync for provider with id: ${providerId} because a sync config does not exist`
          );
        }
        const syncConfig = fromSyncConfigModel(syncConfigModel);
        await prisma.syncConfig.update({
          where: {
            id: syncConfig.id,
          },
          data: {
            ...toSyncConfigModel(upsertObjectToSyncConfig(syncConfig, params.name, params.type)),
          },
        });
      }
      return model;
    });
    return fromProviderModel(model);
  }

  public async update(id: string, applicationId: string, provider: ProviderUpdateParams): Promise<Provider> {
    if (provider.objects) {
      validateObjects(provider.objects);
    }

    const updatedProvider = await this.#prisma.provider.update({
      where: { id },
      data: await toProviderModel({
        ...provider,
        applicationId,
      }),
    });
    return fromProviderModel(updatedProvider);
  }

  public async upsert(provider: ProviderCreateParams): Promise<Provider> {
    if (provider.objects) {
      validateObjects(provider.objects);
    }

    const upsertedProvider = await this.#prisma.provider.upsert({
      where: {
        applicationId_name: {
          applicationId: provider.applicationId,
          name: provider.name,
        },
      },
      create: await toProviderModel(provider),
      update: await toProviderModel(provider),
    });
    return fromProviderModel(upsertedProvider);
  }

  public async delete(id: string, applicationId: string): Promise<void> {
    const syncConfigs = await this.#prisma.syncConfig.findMany({
      where: { providerId: id },
    });
    if (syncConfigs.length) {
      throw new BadRequestError(`Can't delete provider with id: ${id} as it has syncConfigs`);
    }
    const connections = await this.#prisma.connection.findMany({
      where: { providerId: id },
    });
    if (connections.length) {
      throw new BadRequestError(`Can't delete provider with active connections`);
    }

    await this.#prisma.provider.deleteMany({
      where: { id, applicationId },
    });
  }
}

const addObjectToProviderObjects = <T extends ProviderCategory>(
  objects: ProviderObjects<T>,
  name: string,
  type: ObjectType,
  schemaId?: string
): ProviderObjects<T> => {
  function helper() {
    switch (type) {
      case 'common':
        if (objects.common?.find((object) => object.name === name)) {
          throw new BadRequestError(`Common object with name: ${name} already exists in provider`);
        }
        return {
          ...objects,
          common: [...(objects.common ?? []), { name: name as CommonObjectForCategory<T>, schemaId }],
        };
      case 'standard':
        if (objects.standard?.find((object) => object.name === name)) {
          throw new BadRequestError(`Standard object with name: ${name} already exists in provider`);
        }
        return { ...objects, standard: [...(objects.standard ?? []), { name, schemaId }] };
      case 'custom':
        if (objects.custom?.find((object) => object.name === name)) {
          throw new BadRequestError(`Custom object with name: ${name} already exists in provider`);
        }
        return { ...objects, custom: [...(objects.custom ?? []), { name, schemaId }] };
      default:
        throw new BadRequestError(`Invalid type: ${type}`);
    }
  }

  const ret = helper();
  validateObjects(ret);
  return ret;
};

const upsertObjectToSyncConfig = (syncConfig: SyncConfig, name: string, type: ObjectType): SyncConfig => {
  switch (type) {
    case 'common':
      if (syncConfig.config.commonObjects?.find((object) => object.object === name)) {
        return syncConfig;
      }
      return {
        ...syncConfig,
        config: {
          ...syncConfig.config,
          commonObjects: [...(syncConfig.config.commonObjects ?? []), { object: name as CommonObjectType }],
        },
      };
    case 'standard':
      if (syncConfig.config.standardObjects?.find((object) => object.object === name)) {
        return syncConfig;
      }
      return {
        ...syncConfig,
        config: {
          ...syncConfig.config,
          standardObjects: [...(syncConfig.config.standardObjects ?? []), { object: name }],
        },
      };
    case 'custom':
      if (syncConfig.config.customObjects?.find((object) => object.object === name)) {
        return syncConfig;
      }
      return {
        ...syncConfig,
        config: {
          ...syncConfig.config,
          customObjects: [...(syncConfig.config.customObjects ?? []), { object: name }],
        },
      };
    default:
      throw new BadRequestError(`Invalid type: ${type}`);
  }
};

function validateObjects({ common, standard, custom }: ProviderObjects<ProviderCategory>): void {
  // 1. Disallow multiple objects for the same provider to be mapped to the same schema
  // 2. Disallow multiple mappings for objects to schema for the same object name

  if (common) {
    const commonSchemaIds = common.map((object) => object.schemaId);
    if (commonSchemaIds.length !== new Set(commonSchemaIds).size) {
      throw new BadRequestError('Multiple common objects are mapped to the same schema for the same provider');
    }

    const commonObjectNames = common.map((object) => object.name);
    if (commonObjectNames.length !== new Set(commonObjectNames).size) {
      throw new BadRequestError('Multiple entries for mapping an object to a schema');
    }
  }

  if (standard) {
    const standardSchemaIds = standard.map((object) => object.schemaId);
    if (standardSchemaIds.length !== new Set(standardSchemaIds).size) {
      throw new BadRequestError('Multiple standard objects are mapped to the same schema for the same provider');
    }

    const standardObjectNames = standard.map((object) => object.name);
    if (standardObjectNames.length !== new Set(standardObjectNames).size) {
      throw new BadRequestError('Multiple entries for mapping an object to a schema');
    }
  }

  if (custom) {
    const customSchemaIds = custom.map((object) => object.schemaId);
    if (customSchemaIds.length !== new Set(customSchemaIds).size) {
      throw new BadRequestError('Multiple custom objects are mapped to the same schema for the same provider');
    }

    const customObjectNames = custom.map((object) => object.name);
    if (customObjectNames.length !== new Set(customObjectNames).size) {
      throw new BadRequestError('Multiple entries for mapping an object to a schema');
    }
  }
}
