import { SALESFORCE } from '../../../constants';
import { getDependencyContainer } from '../../../dependency_container';
import { DeveloperConfig } from '../../../developer_config/entities';
import { UnsafeSalesforceIntegration } from '../../../integrations/entities';

export abstract class BaseCustomerIntegration {
  readonly #customerId: string;

  public constructor(customerId: string) {
    this.#customerId = customerId;
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
