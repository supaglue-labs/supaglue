import type { PrismaClient } from '@supaglue/db';
import type { SyncConfig, SyncConfigCreateParams, SyncConfigUpdateParams } from '@supaglue/types';
import { NotFoundError } from '../errors';
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
    return Promise.all(syncConfigs.map(fromSyncConfigModel));
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
    return Promise.all(syncConfigs.map(fromSyncConfigModel));
  }

  public async create(syncConfig: SyncConfigCreateParams): Promise<SyncConfig> {
    const createdSyncConfig = await this.#prisma.syncConfig.create({
      data: await toSyncConfigModel(syncConfig),
    });
    return fromSyncConfigModel(createdSyncConfig);
  }

  public async update(id: string, syncConfig: SyncConfigUpdateParams): Promise<SyncConfig> {
    const updatedSyncConfig = await this.#prisma.syncConfig.update({
      where: { id },
      data: await toSyncConfigModel(syncConfig),
    });
    return fromSyncConfigModel(updatedSyncConfig);
  }

  public async upsert(syncConfig: SyncConfigCreateParams): Promise<SyncConfig> {
    const upsertedSyncConfig = await this.#prisma.syncConfig.upsert({
      where: {
        providerId: syncConfig.providerId,
      },
      create: await toSyncConfigModel(syncConfig),
      update: await toSyncConfigModel(syncConfig),
    });
    return fromSyncConfigModel(upsertedSyncConfig);
  }

  public async backfillSyncConfigIds(integrationIdToSyncConfigIdMapping: Record<string, string>): Promise<void> {
    const integrationIds = Object.keys(integrationIdToSyncConfigIdMapping);
    await Promise.all(
      integrationIds.map(async (integrationId) => {
        const syncConfigId = integrationIdToSyncConfigIdMapping[integrationId];
        await this.#prisma.sync.updateMany({
          where: {
            connection: {
              integrationId,
            },
          },
          data: {
            syncConfigId,
          },
        });
      })
    );
  }

  public async delete(id: string, applicationId: string): Promise<void> {
    await this.#prisma.syncConfig.deleteMany({
      where: { id, applicationId },
    });
  }
}
