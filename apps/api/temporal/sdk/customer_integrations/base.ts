import { SALESFORCE } from '../../../constants';
import { getDependencyContainer } from '../../../dependency_container';
import { DeveloperConfig, SyncConfig } from '../../../developer_config/entities';
import { UnsafeSalesforceIntegration } from '../../../integrations/entities';
import { Sync } from '../../../syncs/entities';

export abstract class BaseCustomerIntegration {
  protected readonly sync: Sync;
  protected readonly syncConfig: SyncConfig;
  protected readonly syncRunId: string;
  readonly #customerId: string;

  public constructor(sync: Sync, syncConfig: SyncConfig, syncRunId: string) {
    this.sync = sync;
    this.syncConfig = syncConfig;
    this.syncRunId = syncRunId;
    this.#customerId = sync.customerId;
  }

  // TODO: Generics
  // TODO: Consider another way to access Salesforce app creds in addition to customer Salesforce creds
  protected async getConfigs(): Promise<{
    integrationConfig: UnsafeSalesforceIntegration;
    developerConfig: DeveloperConfig;
  }> {
    // TODO: Abuse of dependency injection
    const { integrationService, developerConfigService } = getDependencyContainer();
    return {
      integrationConfig: await integrationService.getByCustomerIdAndType(
        this.#customerId,
        // TODO: Clean up constants
        SALESFORCE,
        /* unsafe */ true
      ),
      developerConfig: await developerConfigService.getDeveloperConfig(),
    };
  }
}
