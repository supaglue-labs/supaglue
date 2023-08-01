import type {
  ConnectionService,
  ProviderService,
  RemoteService,
  SyncConfigService,
  WebhookService,
} from '@supaglue/core/services';
import type { DestinationService } from '@supaglue/core/services/destination_service';
import type { EntityService } from '@supaglue/core/services/entity_service';
import type { SyncRunService } from '@supaglue/core/services/sync_run_service';
import type { SystemSettingsService } from '@supaglue/core/services/system_settings_service';
import type { ApplicationService, SyncService } from '../services';
import { createClearSyncArgsForNextRun } from './clear_sync_args_for_next_run';
import { createDoProcessSyncChanges } from './do_process_sync_changes';
import { createGetSync } from './get_sync';
import { createLogSyncFinish } from './log_sync_finish';
import { createLogSyncStart } from './log_sync_start';
import { createMaybeSendSyncFinishWebhook } from './maybe_send_sync_finish_webhook';
import { createSyncEntityRecords } from './sync_entity_records';
import { createSyncObjectRecords } from './sync_object_records';
import { createUpdateSyncState } from './update_sync_state';

export const createActivities = ({
  systemSettingsService,
  connectionService,
  remoteService,
  syncService,
  providerService,
  syncConfigService,
  applicationService,
  destinationService,
  syncRunService,
  entityService,
  webhookService,
}: {
  systemSettingsService: SystemSettingsService;
  connectionService: ConnectionService;
  remoteService: RemoteService;
  syncService: SyncService;
  syncConfigService: SyncConfigService;
  providerService: ProviderService;
  applicationService: ApplicationService;
  destinationService: DestinationService;
  syncRunService: SyncRunService;
  entityService: EntityService;
  webhookService: WebhookService;
}) => {
  return {
    getSync: createGetSync(syncService),
    doProcessSyncChanges: createDoProcessSyncChanges(syncService, systemSettingsService),
    updateSyncState: createUpdateSyncState(syncService),
    clearSyncArgsForNextRun: createClearSyncArgsForNextRun(syncService),
    syncObjectRecords: createSyncObjectRecords(
      connectionService,
      remoteService,
      destinationService,
      syncService,
      syncConfigService,
      applicationService
    ),
    syncEntityRecords: createSyncEntityRecords(
      connectionService,
      remoteService,
      destinationService,
      syncService,
      syncConfigService,
      applicationService,
      entityService
    ),
    logSyncStart: createLogSyncStart({ syncRunService }),
    logSyncFinish: createLogSyncFinish({
      syncRunService,
      applicationService,
      connectionService,
    }),
    maybeSendSyncFinishWebhook: createMaybeSendSyncFinishWebhook({
      connectionService,
      providerService,
      applicationService,
      webhookService,
    }),
  };
};
