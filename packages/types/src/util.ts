import { SalesforceObject, SalesforceObjectConfig, SyncConfig } from '.';

export const getSalesforceObjectConfig = (syncConfig: SyncConfig): SalesforceObjectConfig => {
  if (syncConfig.type === 'outbound') {
    return syncConfig.destination.objectConfig;
  }
  return syncConfig.source.objectConfig;
};

export const getDefaultObjectFromSyncConfig = (syncConfig: SyncConfig): SalesforceObject => {
  return getDefaultObject(getSalesforceObjectConfig(syncConfig));
};

const getDefaultObject = (salesforceObjectConfig: SalesforceObjectConfig): SalesforceObject => {
  if (salesforceObjectConfig.type === 'selectable') {
    return salesforceObjectConfig.objectChoices[0];
  }
  return salesforceObjectConfig.object;
};
