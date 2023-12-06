import { Client as HubspotClient } from '@hubspot/api-client';
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
import type { ProviderEntityMapping } from '@supaglue/types/entity_mapping';
import { BadRequestError, NotFoundError } from '../errors';
import { validateEntityOrSchemaFieldName } from '../lib/entity';
import {
  fromCreateParamsToSyncConfigModel,
  fromProviderModel,
  fromSyncConfigModel,
  toProviderModel,
  toSchemaModel,
} from '../mappers';

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

    if (provider.entityMappings) {
      validateEntityMappings(provider.entityMappings);
    }
    if (provider.name === 'hubspot' && provider.config.providerAppId) {
      await this.validateHubspotWebhookConfig(
        provider.config.providerAppId,
        provider.config.oauth.credentials.developerToken
      );
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
            ...fromCreateParamsToSyncConfigModel(
              upsertObjectToSyncConfig(syncConfig, params.name, params.type),
              syncConfig.destinationId,
              providerId
            ),
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

    if (provider.entityMappings) {
      validateEntityMappings(provider.entityMappings);
    }

    if (provider.name === 'hubspot' && provider.config.providerAppId) {
      await this.validateHubspotWebhookConfig(
        provider.config.providerAppId,
        provider.config.oauth.credentials.developerToken
      );
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

    if (provider.entityMappings) {
      validateEntityMappings(provider.entityMappings);
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

  private async validateHubspotWebhookConfig(appId: string, developerToken?: string): Promise<void> {
    if (!developerToken) {
      throw new BadRequestError('Provider config is missing developerToken');
    }

    const alreadyExists = await this.#prisma.provider.findFirst({
      where: {
        hubspotAppId: appId,
      },
    });
    if (alreadyExists) {
      throw new BadRequestError(`HubSpot App ID: ${appId} is already in use by another Application.`);
    }

    try {
      const hubspotClient = new HubspotClient({ developerApiKey: developerToken });
      await hubspotClient.webhooks.settingsApi.getAll(parseInt(appId));
    } catch (e: any) {
      // If no webhooks have been set up yet, it'll return a 404.
      if (e.code === 404) {
        return;
      }
      throw new BadRequestError(`Invalid HubSpot App ID or developer token`);
    }
  }
}

const addObjectToProviderObjects = <T extends ProviderCategory>(
  objects: ProviderObjects<T>,
  name: string,
  type: 'common' | 'standard',
  schemaId?: string
): ProviderObjects<T> => {
  function helper(): ProviderObjects<T> {
    switch (type) {
      case 'common':
        if (objects.common?.find((object) => object.name === name)) {
          throw new BadRequestError(`Common object with name: ${name} already exists in provider`);
        }
        return {
          ...objects,
          common: [...(objects.common ?? []), { name: name as CommonObjectForCategory<T>, schemaId }],
        } as ProviderObjects<T>;
      case 'standard':
        if (objects.standard?.find((object) => object.name === name)) {
          throw new BadRequestError(`Standard object with name: ${name} already exists in provider`);
        }
        return { ...objects, standard: [...(objects.standard ?? []), { name, schemaId }] } as ProviderObjects<T>;
      default:
        throw new BadRequestError(`Invalid type: ${type}`);
    }
  }

  const ret = helper();
  validateObjects(ret);
  return ret;
};

const upsertObjectToSyncConfig = (syncConfig: SyncConfig, name: string, type: 'common' | 'standard'): SyncConfig => {
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
    default:
      throw new BadRequestError(`Invalid type: ${type}`);
  }
};

function validateObjects({ common, standard }: ProviderObjects<ProviderCategory>): void {
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
}

function validateEntityMappings(entityMappings: ProviderEntityMapping[]): void {
  // 1. Disallow multiple entity mappings for the same provider to be mapped to the same object
  // 2. Disallow multiple mappings for entities to object for the same entity name
  // 3. Validate entity field names

  const entityMappingObjects = entityMappings.map((entityMapping) => entityMapping.object);
  if (entityMappingObjects.length !== new Set(entityMappingObjects).size) {
    throw new BadRequestError('Multiple entities mapped to the smae object for the same provider');
  }

  const entityMappingEntityIds = entityMappings.map((entityMapping) => entityMapping.entityId);
  if (entityMappingEntityIds.length !== new Set(entityMappingEntityIds).size) {
    throw new BadRequestError('Multiple entries for mapping the same entity to an object');
  }

  for (const field of entityMappings.flatMap((entityMapping) => entityMapping.fieldMappings ?? [])) {
    validateEntityOrSchemaFieldName(field.entityField);
  }
}
