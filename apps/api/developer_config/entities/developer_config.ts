import { DeveloperConfigSpec, SalesforceCredentials, SyncConfig } from '@supaglue/types';

export class DeveloperConfig {
  #spec: DeveloperConfigSpec;

  public constructor(spec: DeveloperConfigSpec) {
    // TODO We may elect to use a different internal structure here in the future
    this.#spec = spec;
  }

  // TODO: Actually do some validation later, e.g. that we don't have duplicated SyncConfig names.
  public validate(): void {
    return;
  }

  public getSyncConfig(name: string): SyncConfig {
    const syncConfig = this.#spec.syncConfigs.find((s) => s.name === name);
    if (!syncConfig) {
      throw new Error(`SyncConfig not found for ${name}`);
    }
    return syncConfig;
  }

  public getSyncConfigs(): SyncConfig[] {
    return this.#spec.syncConfigs;
  }

  public getSpec(): DeveloperConfigSpec {
    return this.#spec;
  }

  public getSalesforceCredentials(): SalesforceCredentials {
    return this.#spec.salesforceCredentials;
  }
}
