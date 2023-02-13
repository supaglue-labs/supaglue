import { ApplicationFailure } from '@temporalio/common';
import { getDependencyContainer } from '../../dependency_container';
import { createSupaglue } from '../sdk';

type DoSyncArgs = {
  syncId: string;
  syncRunId: string;
};

export async function doSync({ syncId, syncRunId }: DoSyncArgs): Promise<void> {
  const { syncService, developerConfigService } = getDependencyContainer();

  // TODO: Simplify
  // Get sync and developer config
  const sync = await syncService.getSyncById(syncId);

  const developerConfig = await developerConfigService.getDeveloperConfig();
  const syncConfig = developerConfig.getSyncConfig(sync.syncConfigName);

  // Instantiate the SDK and then pass it around
  const sg = createSupaglue(sync, syncConfig, syncRunId);

  // TODO: Do we need `type` on both `Sync` and `SyncConfig`? We should consider
  // only having it on `SyncConfig` for consistency.

  if (sync.type === 'inbound' && syncConfig.type === 'inbound') {
    const records = await sg.customerIntegrations.sources.salesforce.bulkReadSObject();

    if (syncConfig.destination.type === 'postgres') {
      return await sg.internalIntegrations.destinations.postgres.insertRecords(records);
    }

    return await sg.internalIntegrations.destinations.webhook.sendRequests(records);
  }

  if (sync.type === 'outbound' && syncConfig.type === 'outbound') {
    const records = await sg.internalIntegrations.sources.postgres.readAllObjectType();
    return await sg.customerIntegrations.destinations.salesforce.upsertAllRecords(records);
  }

  throw ApplicationFailure.nonRetryable('Sync and SyncConfig types do not match');
}
