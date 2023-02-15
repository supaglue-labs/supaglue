import { SalesforceObject, SalesforceObjectConfig, SyncConfig } from '.';

export const getDefaultObjectFromSyncConfig = (syncConfig: SyncConfig): SalesforceObject => {
  if (syncConfig.type === 'outbound') {
    return getDefaultObject(syncConfig.destination.objectConfig);
  }
  return getDefaultObject(syncConfig.source.objectConfig);
};

const getDefaultObject = (salesforceObjectConfig: SalesforceObjectConfig): SalesforceObject => {
  if (salesforceObjectConfig.type === 'selectable') {
    return salesforceObjectConfig.objectChoices[0];
  }
  return salesforceObjectConfig.object;
};
