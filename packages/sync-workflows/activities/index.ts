import type {
  AccountService,
  ConnectionService,
  ContactService,
  EventService,
  IntegrationService,
  LeadService,
  OpportunityService,
  RemoteService,
  SyncHistoryService,
  UserService,
} from '@supaglue/core/services';
import type { ApplicationService, SyncService } from 'sync-worker/services';
import { createDoProcessSyncChanges } from './do_process_sync_changes';
import { createGetSync } from './get_sync';
import { createImportRecords } from './import_records';
import { createLogSyncFinish } from './log_sync_finish';
import { createLogSyncStart } from './log_sync_start';
import { createMaybeSendSyncFinishWebhook } from './maybe_send_sync_finish_webhook';
import { createSetForceSyncFlag } from './set_force_sync_flag';
import { createUpdateSyncState } from './update_sync_state';

export const createActivities = ({
  connectionService,
  remoteService,
  syncService,
  syncHistoryService,
  integrationService,
  applicationService,
  crm: { accountService, contactService, opportunityService, leadService, userService, eventService },
}: {
  connectionService: ConnectionService;
  remoteService: RemoteService;
  syncService: SyncService;
  syncHistoryService: SyncHistoryService;
  integrationService: IntegrationService;
  applicationService: ApplicationService;
  crm: {
    contactService: ContactService;
    accountService: AccountService;
    opportunityService: OpportunityService;
    leadService: LeadService;
    userService: UserService;
    eventService: EventService;
  };
}) => {
  return {
    getSync: createGetSync(syncService),
    doProcessSyncChanges: createDoProcessSyncChanges(syncService),
    setForceSyncFlag: createSetForceSyncFlag(syncService),
    updateSyncState: createUpdateSyncState(syncService),
    importRecords: createImportRecords(
      accountService,
      connectionService,
      contactService,
      remoteService,
      opportunityService,
      leadService,
      userService,
      eventService
    ),
    logSyncStart: createLogSyncStart({ syncHistoryService }),
    logSyncFinish: createLogSyncFinish({ syncHistoryService }),
    maybeSendSyncFinishWebhook: createMaybeSendSyncFinishWebhook({
      connectionService,
      integrationService,
      applicationService,
    }),
  };
};
