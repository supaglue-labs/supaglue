import type { ConnectionService, ProviderService, RemoteService, SyncConfigService } from '@supaglue/core/services';
import type { DestinationService } from '@supaglue/core/services/destination_service';
import type { ObjectSyncRunService } from '@supaglue/core/services/object_sync_run_service';
import type { SystemSettingsService } from '@supaglue/core/services/system_settings_service';
import type { ApplicationService, SyncService } from '../services';
import { createClearSyncArgsForNextRun } from './clear_sync_args_for_next_run';
import { createDoProcessSyncChanges } from './do_process_sync_changes';
import { createGetObjectSyncInfo as createGetObjectSync } from './get_object_sync';
import { createLogObjectSyncFinish } from './log_object_sync_finish';
import { createLogObjectSyncStart } from './log_object_sync_start';
import { createMaybeSendSyncFinishWebhook } from './maybe_send_sync_finish_webhook';
import { createSyncRecords } from './sync_records';
import { createUpdateObjectSyncState } from './update_object_sync_state';

export const createActivities = ({
  systemSettingsService,
  connectionService,
  remoteService,
  syncService,
  providerService,
  syncConfigService,
  applicationService,
  destinationService,
  objectSyncRunService,
}: {
  systemSettingsService: SystemSettingsService;
  connectionService: ConnectionService;
  remoteService: RemoteService;
  syncService: SyncService;
  syncConfigService: SyncConfigService;
  providerService: ProviderService;
  applicationService: ApplicationService;
  destinationService: DestinationService;
  objectSyncRunService: ObjectSyncRunService;
}) => {
  return {
    getObjectSync: createGetObjectSync(syncService),
    doProcessSyncChanges: createDoProcessSyncChanges(syncService, systemSettingsService),
    updateObjectSyncState: createUpdateObjectSyncState(syncService),
    clearSyncArgsForNextRun: createClearSyncArgsForNextRun(syncService),
    syncRecords: createSyncRecords(
      connectionService,
      remoteService,
      destinationService,
      syncService,
      syncConfigService,
      applicationService
    ),
    logObjectSyncStart: createLogObjectSyncStart({ objectSyncRunService }),
    logObjectSyncFinish: createLogObjectSyncFinish({ objectSyncRunService, applicationService, connectionService }),
    maybeSendSyncFinishWebhook: createMaybeSendSyncFinishWebhook({
      connectionService,
      providerService,
      applicationService,
    }),
  };
};
