import { PrismaClient } from '@prisma/client';
import { SALESFORCE } from '../../constants';
import { NotFoundError } from '../../errors';
import { SyncService } from '../../syncs/services';
import { DeveloperConfig, DeveloperConfigSpec, fromModelToDeveloperConfig } from '../entities';

const DEVELOPER_CONFIG_ID = '1';

export class DeveloperConfigService {
  #prisma: PrismaClient;
  #syncService: SyncService;

  constructor(prisma: PrismaClient, syncService: SyncService) {
    this.#prisma = prisma;
    this.#syncService = syncService;
  }

  public async getDeveloperConfig(): Promise<DeveloperConfig> {
    const developerConfig = await this.findDeveloperConfig();
    if (!developerConfig) {
      throw new NotFoundError('No developer config found');
    }
    return developerConfig;
  }

  public async findDeveloperConfig(): Promise<DeveloperConfig | undefined> {
    const model = await this.#prisma.developerConfig.findFirst();
    if (!model) {
      return;
    }
    return fromModelToDeveloperConfig(model);
  }

  public async createDeveloperConfig(developerConfig: DeveloperConfigSpec): Promise<DeveloperConfig> {
    const model = await this.#prisma.developerConfig.create({
      data: {
        id: DEVELOPER_CONFIG_ID,
        config: developerConfig,
      },
    });
    const newDeveloperConfig = fromModelToDeveloperConfig(model);
    // TODO: Should this not be best-effort?
    await this.backfillNewSyncConfigs(undefined, newDeveloperConfig);
    return newDeveloperConfig;
  }

  public async updateDeveloperConfig(developerConfig: DeveloperConfigSpec): Promise<DeveloperConfig> {
    const oldDeveloperConfig = await this.getDeveloperConfig();
    const model = await this.#prisma.developerConfig.update({
      where: { id: DEVELOPER_CONFIG_ID },
      data: {
        config: developerConfig,
      },
    });
    const newDeveloperConfig = fromModelToDeveloperConfig(model);
    // TODO: Should this not be best-effort?
    await this.backfillNewSyncConfigs(oldDeveloperConfig, newDeveloperConfig);
    return newDeveloperConfig;
  }

  private async backfillNewSyncConfigs(
    oldConfig: DeveloperConfig | undefined,
    newConfig: DeveloperConfig
  ): Promise<void> {
    const syncConfigsToBackfill = this.getNewSyncConfigNames(oldConfig, newConfig);
    // get customers with valid integrations
    const integrationModels = await this.#prisma.integration.findMany({
      where: {
        type: SALESFORCE,
      },
    });
    const customerIds = integrationModels.map(({ customerId }) => customerId);
    await Promise.all(
      customerIds.map((customerId) =>
        Promise.all(
          syncConfigsToBackfill.map((syncConfigName) => {
            // TODO: Make this idempotent in case developer config needs to be updated again
            this.#syncService.createSync(
              {
                syncConfigName,
                customerId,
                enabled: false,
              },
              newConfig
            );
          })
        )
      )
    );
  }

  private getNewSyncConfigNames(oldConfig: DeveloperConfig | undefined, newConfig: DeveloperConfig): string[] {
    const oldSyncConfigNames = oldConfig ? oldConfig.getSyncConfigs().map(({ name }) => name) : [];
    const newSyncConfigNames = newConfig.getSyncConfigs().map(({ name }) => name);
    return newSyncConfigNames.filter((x) => !oldSyncConfigNames.includes(x));
  }
}
