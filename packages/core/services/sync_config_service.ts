import type { PrismaClient } from '@supaglue/db';
import type {
  CommonObjectConfig,
  ProviderCategory,
  SyncConfig,
  SyncConfigCreateParams,
  SyncConfigUpdateParams,
} from '@supaglue/types';
import { CRM_COMMON_MODEL_TYPES } from '@supaglue/types/crm';
import { ENGAGEMENT_COMMON_MODEL_TYPES } from '@supaglue/types/engagement';
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

  public async getBySyncId(syncId: string): Promise<SyncConfig | null> {
    const sync = await this.#prisma.sync.findUnique({
      where: { id: syncId },
    });
    if (!sync) {
      throw new NotFoundError(`Can't find sync with id: ${syncId}`);
    }
    if (!sync.syncConfigId) {
      return null;
    }
    return await this.getById(sync.syncConfigId);
  }

  public async list(applicationId: string): Promise<SyncConfig[]> {
    const syncConfigs = await this.#prisma.syncConfig.findMany({ where: { applicationId } });
    return Promise.all(syncConfigs.map(fromSyncConfigModel));
  }

  public async listByIds(ids: string[]): Promise<SyncConfig[]> {
    const syncConfigs = await this.#prisma.syncConfig.findMany({ where: { id: { in: ids } } });
    return Promise.all(syncConfigs.map(fromSyncConfigModel));
  }

  public async create(syncConfig: SyncConfigCreateParams): Promise<SyncConfig> {
    validateSyncConfigParams(syncConfig);
    // TODO:(SUP1-350): Backfill sync schedules for connections
    const createdSyncConfig = await this.#prisma.syncConfig.create({
      data: await toSyncConfigModel(syncConfig),
    });
    return fromSyncConfigModel(createdSyncConfig);
  }

  public async update(id: string, syncConfig: SyncConfigUpdateParams): Promise<SyncConfig> {
    validateSyncConfigParams(syncConfig);
    // TODO(SUP1-328): Remove once we support updating destinations
    if (syncConfig.destinationId) {
      const { destinationId } = await this.getById(id);
      if (destinationId && destinationId !== syncConfig.destinationId) {
        throw new BadRequestError('Destination cannot be changed');
      }
    }

    const [updatedSyncConfig] = await this.#prisma.$transaction([
      this.#prisma.syncConfig.update({
        where: { id },
        data: await toSyncConfigModel(syncConfig),
      }),
      this.#prisma.syncConfigChange.create({
        data: {
          syncConfigId: id,
        },
      }),
    ]);
    return fromSyncConfigModel(updatedSyncConfig);
  }

  // Only used for backfill
  public async upsert(syncConfig: SyncConfigCreateParams): Promise<SyncConfig> {
    validateSyncConfigParams(syncConfig);
    const upsertedSyncConfig = await this.#prisma.syncConfig.upsert({
      where: {
        providerId: syncConfig.providerId,
      },
      create: await toSyncConfigModel(syncConfig),
      update: await toSyncConfigModel(syncConfig),
    });
    return fromSyncConfigModel(upsertedSyncConfig);
  }

  public async delete(id: string, applicationId: string): Promise<void> {
    const syncs = await this.#prisma.sync.findMany({
      where: {
        syncConfigId: id,
      },
    });
    if (syncs.length) {
      throw new BadRequestError('Cannot delete sync config with active connections');
    }
    await this.#prisma.syncConfig.deleteMany({
      where: { id, applicationId },
    });
  }
}

export const getDefaultCommonObjects = (
  category: ProviderCategory,
  fetchAllFieldsIntoRaw: boolean
): CommonObjectConfig[] => {
  if (category === 'engagement') {
    return ENGAGEMENT_COMMON_MODEL_TYPES.map((object) => ({
      object,
      fetchAllFieldsIntoRaw,
    }));
  }
  return CRM_COMMON_MODEL_TYPES.map((object) => ({
    object,
    fetchAllFieldsIntoRaw,
  }));
};

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
