import type { PrismaClient } from '@supaglue/db';
import type {
  CRMProvider,
  Provider,
  ProviderName,
  SyncConfig,
  SyncConfigCreateParams,
  SyncConfigData,
  SyncConfigDTO,
  SyncConfigUpdateParams,
} from '@supaglue/types';
import { BadRequestError, NotFoundError } from '../errors';
import { deleteWebhookSubscriptions, updateWebhookSubscriptions } from '../lib/hubspot_webhook';
import { fromCreateParamsToSyncConfigModel, fromSyncConfigDataModel, fromSyncConfigModel } from '../mappers';
import type { ProviderService } from './provider_service';

export class SyncConfigService {
  #prisma: PrismaClient;
  #providerService: ProviderService;

  constructor(prisma: PrismaClient, providerService: ProviderService) {
    this.#prisma = prisma;
    this.#providerService = providerService;
  }

  public async getByIds(ids: string[]): Promise<SyncConfig[]> {
    const syncConfigs = await this.#prisma.syncConfig.findMany({
      where: { id: { in: ids } },
    });
    return syncConfigs.map(fromSyncConfigModel);
  }

  public async getById(id: string): Promise<SyncConfig> {
    const syncConfig = await this.#prisma.syncConfig.findUnique({
      where: { id },
    });
    if (!syncConfig) {
      throw new NotFoundError(`Can't find syncConfig with id: ${id}`);
    }
    return fromSyncConfigModel(syncConfig);
  }

  public async findByProviderId(providerId: string): Promise<SyncConfig | null> {
    const syncConfig = await this.#prisma.syncConfig.findUnique({
      where: { providerId },
    });
    if (!syncConfig) {
      return null;
    }
    return fromSyncConfigModel(syncConfig);
  }

  public async getByProviderId(providerId: string): Promise<SyncConfig> {
    const syncConfig = await this.#prisma.syncConfig.findUnique({
      where: { providerId },
    });
    if (!syncConfig) {
      throw new NotFoundError(`Can't find syncConfig with providerId: ${providerId}`);
    }
    return fromSyncConfigModel(syncConfig);
  }

  public async listByProviderIds(providerIds: string[]): Promise<SyncConfig[]> {
    const syncConfigs = await this.#prisma.syncConfig.findMany({
      where: {
        providerId: {
          in: providerIds,
        },
      },
    });
    return syncConfigs.map(fromSyncConfigModel);
  }

  public async getByIdAndApplicationId(id: string, applicationId: string): Promise<SyncConfig> {
    const syncConfig = await this.#prisma.syncConfig.findUnique({
      where: { id },
    });
    if (!syncConfig || syncConfig.applicationId !== applicationId) {
      throw new NotFoundError(`Can't find syncConfig with id: ${id}`);
    }
    return fromSyncConfigModel(syncConfig);
  }

  public async list(applicationId: string): Promise<SyncConfig[]> {
    const syncConfigs = await this.#prisma.syncConfig.findMany({ where: { applicationId } });
    return syncConfigs.map(fromSyncConfigModel);
  }

  public async listByIds(ids: string[]): Promise<SyncConfig[]> {
    const syncConfigs = await this.#prisma.syncConfig.findMany({ where: { id: { in: ids } } });
    return syncConfigs.map(fromSyncConfigModel);
  }

  public async toSyncConfigDTO(syncConfig: SyncConfig): Promise<SyncConfigDTO> {
    const dtos = await this.toSyncConfigDTOs([syncConfig]);
    return dtos[0];
  }

  public async toSyncConfigDTOs(syncConfigs: SyncConfig[]): Promise<SyncConfigDTO[]> {
    const syncConfigsExpanded = await this.#prisma.syncConfig.findMany({
      where: {
        id: {
          in: syncConfigs.map((syncConfig) => syncConfig.id),
        },
      },
      include: {
        destination: true,
        provider: true,
      },
    });
    return syncConfigsExpanded.map((syncConfigModel) => ({
      id: syncConfigModel.id,
      applicationId: syncConfigModel.applicationId,
      destinationName: syncConfigModel.destination.name,
      providerName: syncConfigModel.provider.name as ProviderName,
      config: fromSyncConfigDataModel(syncConfigModel.config),
    }));
  }

  public async create(syncConfig: SyncConfigCreateParams): Promise<SyncConfig> {
    validateSyncConfigParams(syncConfig);
    const destination = await this.#prisma.destination.findUnique({
      where: {
        applicationId_name: {
          applicationId: syncConfig.applicationId,
          name: syncConfig.destinationName,
        },
      },
      select: {
        id: true,
      },
    });
    if (!destination) {
      throw new NotFoundError(`Destination with name ${syncConfig.destinationName} not found`);
    }

    const provider = await this.#providerService.getByNameAndApplicationId(
      syncConfig.providerName,
      syncConfig.applicationId
    );
    if (syncConfig.providerName === 'hubspot' && (provider as CRMProvider).hubspotAppId) {
      await this.#updateHubspotWebhookSubscriptions(provider, syncConfig.config);
    }
    // TODO:(SUP1-350): Backfill sync schedules for connections
    const createdSyncConfigModel = await this.#prisma.$transaction(async (tx) => {
      const createdSyncConfigModel = await tx.syncConfig.create({
        data: fromCreateParamsToSyncConfigModel(syncConfig, destination.id, provider.id),
      });

      await tx.syncConfigChange.create({
        data: {
          syncConfigId: createdSyncConfigModel.id,
        },
      });

      return createdSyncConfigModel;
    });

    return fromSyncConfigModel(createdSyncConfigModel);
  }

  public async update(
    id: string,
    applicationId: string,
    params: SyncConfigUpdateParams,
    force_delete_syncs = false
  ): Promise<SyncConfig> {
    validateSyncConfigParams(params);
    if (!force_delete_syncs) {
      const affectedSyncsCount = await this.#diffAndCountAffectedSyncs(id, applicationId, params);
      if (affectedSyncsCount) {
        throw new BadRequestError(
          `This SyncConfig update operation will delete ~${affectedSyncsCount} syncs. If you are sure you want to do this, set force_delete_syncs to true.`
        );
      }
    }
    const [updatedSyncConfigModel] = await this.#prisma.$transaction([
      this.#prisma.syncConfig.update({
        where: { id, applicationId },
        data: { config: params.config },
      }),
      this.#prisma.syncConfigChange.create({
        data: {
          syncConfigId: id,
        },
      }),
    ]);
    const syncConfig = fromSyncConfigModel(updatedSyncConfigModel);

    const provider = await this.#providerService.getById(syncConfig.providerId);

    if (provider.name === 'hubspot' && provider.hubspotAppId) {
      await this.#updateHubspotWebhookSubscriptions(provider, syncConfig.config);
    }
    return syncConfig;
  }

  async #diffAndCountAffectedSyncs(id: string, applicationId: string, params: SyncConfigUpdateParams): Promise<number> {
    const syncConfig = await this.getByIdAndApplicationId(id, applicationId);
    // diff objects in the old and new sync configs
    const oldObjectNames: string[][] = [
      syncConfig.config.commonObjects?.map((object) => object.object) ?? [],
      syncConfig.config.standardObjects?.map((object) => object.object) ?? [],
      syncConfig.config.customObjects?.map((object) => object.object) ?? [],
      syncConfig.config.entities?.map((entity) => entity.entityId) ?? [],
    ];

    const newObjectNames: Set<string>[] = [
      new Set<string>(params.config.commonObjects?.map((object) => object.object) ?? []),
      new Set<string>(params.config.standardObjects?.map((object) => object.object) ?? []),
      new Set<string>(params.config.customObjects?.map((object) => object.object) ?? []),
      new Set<string>(params.config.entities?.map((entity) => entity.entityId) ?? []),
    ];

    const deletedObjectsAndEntities = [
      oldObjectNames[0].filter((x) => !newObjectNames[0].has(x)),
      oldObjectNames[1].filter((x) => !newObjectNames[1].has(x)),
      oldObjectNames[2].filter((x) => !newObjectNames[2].has(x)),
      oldObjectNames[3].filter((x) => !newObjectNames[3].has(x)),
    ];

    // find affected syncs
    let count = 0;
    if (deletedObjectsAndEntities[0].length) {
      count += await this.#prisma.sync.count({
        where: {
          syncConfigId: id,
          object: {
            in: deletedObjectsAndEntities[0],
          },
          objectType: 'common',
        },
      });
    }

    if (deletedObjectsAndEntities[1].length) {
      count += await this.#prisma.sync.count({
        where: {
          syncConfigId: id,
          object: {
            in: deletedObjectsAndEntities[1],
          },
          objectType: 'standard',
        },
      });
    }

    if (deletedObjectsAndEntities[2].length) {
      count += await this.#prisma.sync.count({
        where: {
          syncConfigId: id,
          object: {
            in: deletedObjectsAndEntities[2],
          },
          objectType: 'custom',
        },
      });
    }

    if (deletedObjectsAndEntities[3].length) {
      count += await this.#prisma.sync.count({
        where: {
          syncConfigId: id,
          entityId: {
            in: deletedObjectsAndEntities[3],
          },
        },
      });
    }

    return count;
  }

  // Only used for backfill
  public async upsert(syncConfig: SyncConfigCreateParams): Promise<SyncConfig> {
    validateSyncConfigParams(syncConfig);
    const destination = await this.#prisma.destination.findUnique({
      where: {
        applicationId_name: {
          applicationId: syncConfig.applicationId,
          name: syncConfig.destinationName,
        },
      },
      select: {
        id: true,
      },
    });
    if (!destination) {
      throw new NotFoundError(`Destination with name ${syncConfig.destinationName} not found`);
    }

    const provider = await this.#prisma.provider.findUnique({
      where: {
        applicationId_name: {
          applicationId: syncConfig.applicationId,
          name: syncConfig.providerName,
        },
      },
      select: {
        id: true,
      },
    });
    if (!provider) {
      throw new NotFoundError(`Provider with name ${syncConfig.providerName} not found`);
    }

    const upsertedSyncConfigModel = await this.#prisma.$transaction(async (tx) => {
      const upsertedSyncConfigModel = await tx.syncConfig.upsert({
        where: {
          providerId: provider.id,
        },
        create: fromCreateParamsToSyncConfigModel(syncConfig, destination.id, provider.id),
        update: {
          config: syncConfig.config,
        },
      });

      await tx.syncConfigChange.create({
        data: {
          syncConfigId: upsertedSyncConfigModel.id,
        },
      });

      return upsertedSyncConfigModel;
    });
    return fromSyncConfigModel(upsertedSyncConfigModel);
  }

  public async delete(id: string, applicationId: string, forceDeleteSyncs = false): Promise<void> {
    const syncs = await this.#prisma.sync.findMany({
      where: {
        syncConfigId: id,
      },
    });
    if (syncs.length && !forceDeleteSyncs) {
      throw new BadRequestError(
        `Deleting this syncConfig will delete ~${syncs.length} syncs. If you are sure you want to do this, set force_delete_syncs to true.`
      );
    }

    const syncConfig = await this.getByIdAndApplicationId(id, applicationId);

    await this.#prisma.$transaction([
      this.#prisma.syncChange.createMany({
        data: syncs.map((sync) => ({
          syncId: sync.id,
        })),
      }),
      this.#prisma.sync.deleteMany({
        where: {
          syncConfigId: id,
        },
      }),
      this.#prisma.syncConfig.deleteMany({
        where: { id, applicationId },
      }),
      this.#prisma.syncConfigChange.create({
        data: {
          syncConfigId: id,
        },
      }),
    ]);

    try {
      const provider = await this.#providerService.getById(syncConfig.providerId);
      if (provider.name === 'hubspot' && provider.hubspotAppId) {
        await this.#deleteHubspotWebhookSubscriptions(provider);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to delete hubspot webhooks for syncConfig ${id}`, e);
    }
  }

  async #updateHubspotWebhookSubscriptions(provider: Provider, syncConfigData: SyncConfigData): Promise<void> {
    if (provider.authType === 'oauth2' && provider.config.oauth.credentials.developerToken) {
      const standardObjects = syncConfigData.standardObjects?.map((object) => object.object) ?? [];
      const commonObjects = syncConfigData.commonObjects?.map((object) => object.object) ?? [];
      const associationObjects: ('contact' | 'company' | 'deal')[] = [];
      if (commonObjects.includes('contact') || standardObjects.includes('contact')) {
        associationObjects.push('contact');
      }
      if (commonObjects.includes('account') || standardObjects.includes('company')) {
        associationObjects.push('company');
      }
      if (commonObjects.includes('opportunity') || standardObjects.includes('deal')) {
        associationObjects.push('deal');
      }
      await updateWebhookSubscriptions(
        provider.config.oauth.credentials.developerToken,
        parseInt(provider.config.providerAppId),
        associationObjects
      );
    }
  }

  async #deleteHubspotWebhookSubscriptions(provider: Provider): Promise<void> {
    if (provider.authType === 'oauth2' && provider.config.oauth.credentials.developerToken) {
      await deleteWebhookSubscriptions(
        provider.config.oauth.credentials.developerToken,
        parseInt(provider.config.providerAppId)
      );
    }
  }
}

export const validateSyncConfigParams = (params: SyncConfigCreateParams | SyncConfigUpdateParams): void => {
  // Check that there are no duplicates among objects
  const commonObjects = params.config.commonObjects?.map((object) => object.object) ?? [];
  const allObjects = [...(params.config.standardObjects?.map((object) => object.object) ?? [])];

  const commonObjectDuplicates = commonObjects.filter((object, index) => commonObjects.indexOf(object) !== index);
  const allObjectDuplicates = allObjects.filter((object, index) => allObjects.indexOf(object) !== index);

  if (commonObjectDuplicates.length > 0) {
    throw new BadRequestError(`Duplicate common objects found: ${commonObjectDuplicates.join(', ')}`);
  }
  if (allObjectDuplicates.length > 0) {
    throw new BadRequestError(`Duplicate standard objects found: ${allObjectDuplicates.join(', ')}`);
  }

  // check that there are no duplicates among entities
  const entityIds = params.config.entities?.map((entity) => entity.entityId) ?? [];
  const entityDuplicates = entityIds.filter((entityId, index) => entityIds.indexOf(entityId) !== index);

  if (entityDuplicates.length > 0) {
    throw new BadRequestError(`Duplicate entities found: ${entityDuplicates.join(', ')}`);
  }

  // Validate that `fullSyncEveryNIncrementals` >= 1
  if (params.config.defaultConfig.strategy === 'full only' && params.config.defaultConfig.fullSyncEveryNIncrementals) {
    throw new BadRequestError('fullSyncEveryNIncrementals cannot be set for full syncs');
  }
  [
    ...(params.config.commonObjects ?? []),
    ...(params.config.customObjects ?? []),
    ...(params.config.standardObjects ?? []),
  ].forEach((objectConfig) => {
    if (
      objectConfig.syncStrategyOverride?.strategy === 'full only' &&
      objectConfig.syncStrategyOverride.fullSyncEveryNIncrementals
    ) {
      throw new BadRequestError('fullSyncEveryNIncrementals cannot be set for full syncs');
    }
  });
  if (
    params.config.defaultConfig.fullSyncEveryNIncrementals !== undefined &&
    params.config.defaultConfig.fullSyncEveryNIncrementals < 1
  ) {
    throw new BadRequestError('fullSyncEveryNIncrementals must be greater than 0');
  }
  [
    ...(params.config.commonObjects ?? []),
    ...(params.config.customObjects ?? []),
    ...(params.config.standardObjects ?? []),
  ].forEach((objectConfig) => {
    if (
      objectConfig.syncStrategyOverride?.fullSyncEveryNIncrementals !== undefined &&
      objectConfig.syncStrategyOverride?.fullSyncEveryNIncrementals < 1
    ) {
      throw new BadRequestError('fullSyncEveryNIncrementals must be greater than 0');
    }
  });
};
