import type { PrismaClient } from '@supaglue/db';
import type {
  ProviderName,
  SyncConfig,
  SyncConfigCreateParams,
  SyncConfigDTO,
  SyncConfigUpdateParams,
} from '@supaglue/types';
import { BadRequestError, NotFoundError } from '../errors';
import { fromCreateParamsToSyncConfigModel, fromSyncConfigDataModel, fromSyncConfigModel } from '../mappers';

export class SyncConfigService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
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

  public async update(id: string, applicationId: string, params: SyncConfigUpdateParams): Promise<SyncConfig> {
    validateSyncConfigParams(params);
    const [updatedSyncConfigModel] = await this.#prisma.$transaction([
      this.#prisma.syncConfig.update({
        where: { id },
        data: { config: params.config },
      }),
      this.#prisma.syncConfigChange.create({
        data: {
          syncConfigId: id,
        },
      }),
    ]);
    return fromSyncConfigModel(updatedSyncConfigModel);
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

  public async delete(id: string, applicationId: string): Promise<void> {
    const syncs = await this.#prisma.sync.findMany({
      where: {
        syncConfigId: id,
      },
    });
    await this.#prisma.$transaction([
      this.#prisma.syncConfig.deleteMany({
        where: { id, applicationId },
      }),
      this.#prisma.syncConfigChange.create({
        data: {
          syncConfigId: id,
        },
      }),
      this.#prisma.sync.deleteMany({
        where: {
          syncConfigId: id,
        },
      }),
      this.#prisma.syncChange.createMany({
        data: syncs.map((sync) => ({
          syncId: sync.id,
        })),
      }),
    ]);
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
