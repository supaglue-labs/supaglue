import type { PrismaClient } from '@supaglue/db';
import type { SyncConfig, SyncConfigCreateParams, SyncConfigUpdateParams } from '@supaglue/types';
import { BadRequestError, NotFoundError } from '../errors';
import { fromSyncConfigModel, toSyncConfigModel } from '../mappers';

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

  public async create(syncConfig: SyncConfigCreateParams): Promise<SyncConfig> {
    validateSyncConfigParams(syncConfig);
    // TODO:(SUP1-350): Backfill sync schedules for connections
    const createdSyncConfigModel = await this.#prisma.$transaction(async (tx) => {
      const createdSyncConfigModel = await tx.syncConfig.create({
        data: toSyncConfigModel(syncConfig),
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
    // TODO(SUP1-328): Remove once we support updating destinations
    if (params.destinationId) {
      const { destinationId } = await this.getById(id);
      if (destinationId && destinationId !== params.destinationId) {
        throw new BadRequestError('Destination cannot be changed');
      }
    }

    const [updatedSyncConfigModel] = await this.#prisma.$transaction([
      this.#prisma.syncConfig.update({
        where: { id },
        data: toSyncConfigModel({ ...params, applicationId }),
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
    const upsertedSyncConfig = await this.#prisma.syncConfig.upsert({
      where: {
        providerId: syncConfig.providerId,
      },
      create: toSyncConfigModel(syncConfig),
      update: toSyncConfigModel(syncConfig),
    });
    return fromSyncConfigModel(upsertedSyncConfig);
  }

  public async delete(id: string, applicationId: string): Promise<void> {
    const objectSyncs = await this.#prisma.objectSync.findMany({
      where: {
        syncConfigId: id,
      },
    });
    if (objectSyncs.length) {
      throw new BadRequestError('Cannot delete sync config with active connections');
    }
    await this.#prisma.syncConfig.deleteMany({
      where: { id, applicationId },
    });
  }
}

const validateSyncConfigParams = (params: SyncConfigCreateParams | SyncConfigUpdateParams): void => {
  // Check that there are no duplicates
  const commonObjects = params.config.commonObjects?.map((object) => object.object) ?? [];
  const allObjects = [
    ...(params.config.standardObjects?.map((object) => object.object) ?? []),
    ...(params.config.customObjects?.map((object) => object.object) ?? []),
  ];

  const commonObjectDuplicates = commonObjects.filter((object, index) => commonObjects.indexOf(object) !== index);
  const allObjectDuplicates = allObjects.filter((object, index) => allObjects.indexOf(object) !== index);

  if (commonObjectDuplicates.length > 0) {
    throw new BadRequestError(`Duplicate common objects found: ${commonObjectDuplicates.join(', ')}`);
  }
  if (allObjectDuplicates.length > 0) {
    throw new BadRequestError(`Duplicate standard/custom objects found: ${allObjectDuplicates.join(', ')}`);
  }
};
