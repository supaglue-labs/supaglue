import {
  ConnectionService,
  ProviderService,
  RemoteService,
  SchemaService,
  SyncConfigService,
  SyncHistoryService,
} from '@supaglue/core/services';
import { DestinationService } from '@supaglue/core/services/destination_service';
import { ObjectSyncRunService } from '@supaglue/core/services/object_sync_run_service';
import type { ApplicationService, SyncService } from '../services';
import { createDoProcessSyncChanges } from './do_process_sync_changes';
import { createGetDestination } from './get_destination';
import { createGetObjectSyncInfo as createGetObjectSync } from './get_object_sync';
import { createGetSync } from './get_sync';
import { createGetSyncConfigBySyncId } from './get_sync_config_by_sync_id';
import { createLogObjectSyncFinish } from './log_object_sync_finish';
import { createLogObjectSyncStart } from './log_object_sync_start';
import { createLogSyncFinish } from './log_sync_finish';
import { createLogSyncStart } from './log_sync_start';
import { createMaybeSendSyncFinishWebhook } from './maybe_send_sync_finish_webhook';
import { createSetForceSyncFlag } from './set_force_sync_flag';
import { createSyncRawRecordsToDestination } from './sync_raw_records_to_destination';
import { createSyncRecords } from './sync_records';
import { createSyncRecordsToDestination } from './sync_records_to_destination';
import { createUpdateObjectSyncState } from './update_object_sync_state';
import { createUpdateSyncState } from './update_sync_state';

export const createActivities = ({
  connectionService,
  remoteService,
  syncService,
  syncHistoryService,
  providerService,
  syncConfigService,
  applicationService,
  destinationService,
  schemaService,
  objectSyncRunService,
}: {
  connectionService: ConnectionService;
  remoteService: RemoteService;
  syncService: SyncService;
  syncHistoryService: SyncHistoryService;
  syncConfigService: SyncConfigService;
  providerService: ProviderService;
  applicationService: ApplicationService;
  destinationService: DestinationService;
  schemaService: SchemaService;
  objectSyncRunService: ObjectSyncRunService;
}) => {
  return {
    getObjectSync: createGetObjectSync(syncService),
    getSync: createGetSync(syncService),
    getDestination: createGetDestination(destinationService),
    getSyncConfigBySyncId: createGetSyncConfigBySyncId(syncConfigService),
    doProcessSyncChanges: createDoProcessSyncChanges(syncService),
    setForceSyncFlag: createSetForceSyncFlag(syncService),
    updateSyncState: createUpdateSyncState(syncService),
    updateObjectSyncState: createUpdateObjectSyncState(syncService),
    syncRecords: createSyncRecords(
      connectionService,
      remoteService,
      destinationService,
      syncService,
      syncConfigService,
      applicationService,
      schemaService
    ),
    syncRecordsToDestination: createSyncRecordsToDestination(
      connectionService,
      remoteService,
      destinationService,
      syncConfigService,
      applicationService,
      schemaService
    ),
    syncRawRecordsToDestination: createSyncRawRecordsToDestination(
      connectionService,
      remoteService,
      destinationService,
      applicationService,
      syncConfigService,
      schemaService
    ),
    logSyncStart: createLogSyncStart({ syncHistoryService }),
    logSyncFinish: createLogSyncFinish({ syncHistoryService, applicationService, connectionService }),
    logObjectSyncStart: createLogObjectSyncStart({ objectSyncRunService }),
    logObjectSyncFinish: createLogObjectSyncFinish({ objectSyncRunService, applicationService, connectionService }),
    maybeSendSyncFinishWebhook: createMaybeSendSyncFinishWebhook({
      connectionService,
      providerService,
      applicationService,
    }),
  };
};
