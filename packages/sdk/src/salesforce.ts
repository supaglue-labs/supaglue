import { BaseSyncConfig, BaseSyncConfigParams } from './base';

export type SalesforceCredentialsParams = {
  loginUrl: string;
  clientId: string;
  clientSecret: string;
};

export function salesforceCredentials(params: SalesforceCredentialsParams) {
  return new SalesforceCredentials(params);
}

export class SalesforceCredentials {
  loginUrl: string;
  clientId: string;
  clientSecret: string;

  constructor({ loginUrl, clientId, clientSecret }: SalesforceCredentialsParams) {
    this.loginUrl = loginUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  toJSON() {
    return {
      loginUrl: this.loginUrl,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
    };
  }
}

type SyncConfigParams = BaseSyncConfigParams & {
  salesforceObject: string;
};

export function syncConfig(params: SyncConfigParams) {
  return new SalesforceSyncConfig(params);
}

export class SalesforceSyncConfig extends BaseSyncConfig {
  salesforceObject: string;

  constructor(params: SyncConfigParams) {
    super(params);
    const { salesforceObject } = params;
    this.salesforceObject = salesforceObject;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      salesforceObject: this.salesforceObject,
    };
  }
}

export type DeveloperConfigParams = {
  syncConfigs: SalesforceSyncConfig[];
  salesforceCredentials: SalesforceCredentials;
};

export function developerConfig(params: DeveloperConfigParams) {
  return new DeveloperConfig(params);
}

export class DeveloperConfig {
  syncConfigs: SalesforceSyncConfig[];
  salesforceCredentials: SalesforceCredentials;

  constructor({ syncConfigs, salesforceCredentials }: DeveloperConfigParams) {
    this.salesforceCredentials = salesforceCredentials;
    this.syncConfigs = syncConfigs;
  }

  toJSON() {
    return {
      salesforceCredentials: this.salesforceCredentials.toJSON(),
      syncConfigs: this.syncConfigs.map((syncConfig) => syncConfig.toJSON()),
    };
  }
}
