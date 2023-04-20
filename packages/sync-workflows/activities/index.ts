import type { ConnectionService, IntegrationService, RemoteService, SyncHistoryService } from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import type { ApplicationService, SyncService } from 'sync-worker/services';
import { createDoProcessSyncChanges } from './do_process_sync_changes';
import { createGetSync } from './get_sync';
import { createImportRecords } from './import_records';
import { createLogSyncFinish } from './log_sync_finish';
import { createLogSyncStart } from './log_sync_start';
import { createMaybeSendSyncFinishWebhook } from './maybe_send_sync_finish_webhook';
import { createUpdateSyncState } from './update_sync_state';

export const createActivities = ({
  connectionService,
  remoteService,
  syncService,
  syncHistoryService,
  integrationService,
  applicationService,
  destinationService,
}: {
  connectionService: ConnectionService;
  remoteService: RemoteService;
  syncService: SyncService;
  syncHistoryService: SyncHistoryService;
  integrationService: IntegrationService;
  applicationService: ApplicationService;
  destinationService: DestinationService;
}) => {
  return {
    getSync: createGetSync(syncService),
    doProcessSyncChanges: createDoProcessSyncChanges(syncService),
    updateSyncState: createUpdateSyncState(syncService),
    importRecords: createImportRecords(connectionService, remoteService, destinationService),
    logSyncStart: createLogSyncStart({ syncHistoryService }),
    logSyncFinish: createLogSyncFinish({ syncHistoryService }),
    maybeSendSyncFinishWebhook: createMaybeSendSyncFinishWebhook({
      connectionService,
      integrationService,
      applicationService,
    }),
  };
};
