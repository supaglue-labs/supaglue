import { getDependencyContainer } from '../../../dependency_container';
import { DeveloperConfig, SyncConfig } from '../../../developer_config/entities';
import { Sync } from '../../../syncs/entities';

export abstract class BaseInternalIntegration {
  protected readonly sync: Sync;
  protected readonly syncConfig: SyncConfig;
  protected readonly syncRunId: string;

  public constructor(sync: Sync, syncConfig: SyncConfig, syncRunId: string) {
    this.sync = sync;
    this.syncConfig = syncConfig;
    this.syncRunId = syncRunId;
  }

  protected async getDeveloperConfig(): Promise<DeveloperConfig> {
    // TODO: Abuse of dependency injection
    const { developerConfigService } = getDependencyContainer();
    return await developerConfigService.getDeveloperConfig();
  }
}
