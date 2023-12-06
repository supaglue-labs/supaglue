import type { SyncConfig, SyncStrategyConfigWithHubspotAssociationsToFetch } from '@supaglue/types';
import type { Sync } from '@supaglue/types/sync';

export function getFriendlySyncStrategyType(syncStrategyType: string) {
  if (syncStrategyType === 'full then incremental') {
    return 'incremental';
  } else if (syncStrategyType === 'full only') {
    return 'full';
  }

  return 'incremental';
}

// @todo: move this to a shared package. encapsulate supaglue concepts into classes
export function getSyncStrategyConfigAndHubspotAssociationsToFetch(
  syncConfig: SyncConfig,
  sync: Sync
): SyncStrategyConfigWithHubspotAssociationsToFetch {
  // @deprecated
  if (sync.type === 'entity') {
    return syncConfig.config.defaultConfig;
  }

  if (sync.objectType === 'common') {
    const commonObjectConfig = syncConfig.config.commonObjects?.find((object) => object.object === sync.object);
    return {
      ...(commonObjectConfig?.syncStrategyOverride ?? syncConfig.config.defaultConfig),
      associationsToFetch: commonObjectConfig?.associationsToFetch,
    };
  }
  if (sync.objectType === 'standard') {
    const standardObjectConfig = syncConfig.config.standardObjects?.find((object) => object.object === sync.object);
    return {
      ...(standardObjectConfig?.syncStrategyOverride ?? syncConfig.config.defaultConfig),
      associationsToFetch: standardObjectConfig?.associationsToFetch,
    };
  }
  if (sync.objectType === 'custom') {
    const customObjectConfig = syncConfig.config.customObjects?.find((object) => object.object === sync.object);
    return {
      ...(customObjectConfig?.syncStrategyOverride ?? syncConfig.config.defaultConfig),
      associationsToFetch: customObjectConfig?.associationsToFetch,
    };
  }
  return syncConfig.config.defaultConfig;
}
