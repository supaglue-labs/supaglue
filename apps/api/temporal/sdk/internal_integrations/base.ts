import { getDependencyContainer } from '../../../dependency_container';
import { DeveloperConfig } from '../../../developer_config/entities';

export abstract class BaseInternalIntegration {
  protected async getDeveloperConfig(): Promise<DeveloperConfig> {
    // TODO: Abuse of dependency injection
    const { developerConfigService } = getDependencyContainer();
    return await developerConfigService.getDeveloperConfig();
  }
}
