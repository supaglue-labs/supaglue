import type { ConnectionService, ProviderService, RemoteService, SyncConfigService } from '@supaglue/core/services';
import type { DestinationService } from '@supaglue/core/services/destination_service';
import type { EntitySyncRunService } from '@supaglue/core/services/entity_sync_run_service';
import type { ObjectSyncRunService } from '@supaglue/core/services/object_sync_run_service';
import type { SystemSettingsService } from '@supaglue/core/services/system_settings_service';
import type { ApplicationService, SyncService } from '../services';
import { createClearEntitySyncArgsForNextRun } from './clear_entity_sync_args_for_next_run';
import { createClearObjectSyncArgsForNextRun } from './clear_object_sync_args_for_next_run';
import { createDoProcessSyncChanges } from './do_process_sync_changes';
import { createGetEntitySync } from './get_entity_sync';
import { createGetObjectSync } from './get_object_sync';
import { createLogEntitySyncFinish } from './log_entity_sync_finish';
import { createLogEntitySyncStart } from './log_entity_sync_start';
import { createLogObjectSyncFinish } from './log_object_sync_finish';
import { createLogObjectSyncStart } from './log_object_sync_start';
import { createMaybeSendEntitySyncFinishWebhook } from './maybe_send_entity_sync_finish_webhook';
import { createMaybeSendObjectSyncFinishWebhook } from './maybe_send_object_sync_finish_webhook';
import { createSyncEntityRecords } from './sync_entity_records';
import { createSyncObjectRecords } from './sync_object_records';
import { createUpdateEntitySyncState } from './update_entity_sync_state';
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
  entitySyncRunService,
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
  entitySyncRunService: EntitySyncRunService;
}) => {
  return {
    doProcessSyncChanges: createDoProcessSyncChanges(syncService, systemSettingsService),
    // object activities
    getObjectSync: createGetObjectSync(syncService),
    updateObjectSyncState: createUpdateObjectSyncState(syncService),
    clearObjectSyncArgsForNextRun: createClearObjectSyncArgsForNextRun(syncService),
    syncObjectRecords: createSyncObjectRecords(
      connectionService,
      remoteService,
      destinationService,
      syncService,
      syncConfigService,
      applicationService
    ),
    logObjectSyncStart: createLogObjectSyncStart({ objectSyncRunService }),
    logObjectSyncFinish: createLogObjectSyncFinish({ objectSyncRunService, applicationService, connectionService }),
    maybeSendObjectSyncFinishWebhook: createMaybeSendObjectSyncFinishWebhook({
      connectionService,
      providerService,
      applicationService,
    }),
    // entity activities
    getEntitySync: createGetEntitySync(syncService),
    updateEntitySyncState: createUpdateEntitySyncState(syncService),
    clearEntitySyncArgsForNextRun: createClearEntitySyncArgsForNextRun(syncService),
    syncEntityRecords: createSyncEntityRecords(
      connectionService,
      remoteService,
      destinationService,
      syncService,
      syncConfigService,
      applicationService
    ),
    logEntitySyncStart: createLogEntitySyncStart({ entitySyncRunService }),
    logEntitySyncFinish: createLogEntitySyncFinish({ entitySyncRunService, applicationService, connectionService }),
    maybeSendEntitySyncFinishWebhook: createMaybeSendEntitySyncFinishWebhook({
      connectionService,
      providerService,
      applicationService,
    }),
  };
};
