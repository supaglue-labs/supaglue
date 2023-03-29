import {
  AccountService,
  ApplicationService,
  ConnectionService,
  ContactService,
  IntegrationService,
  LeadService,
  OpportunityService,
  RemoteService,
  SyncHistoryService,
  UserService,
} from '@supaglue/core/services';
import { SyncService } from 'sync-worker/services/sync_service';
import { createGetSync } from './get_sync';
import { createImportRecords } from './import_records';
import { createLogSyncFinish } from './log_sync_finish';
import { createLogSyncStart } from './log_sync_start';
import { createMaybeSendSyncFinishWebhook } from './maybe_send_sync_finish_webhook';
import { createPopulateAssociations } from './populate_associations';
import { createUpdateSyncState } from './update_sync_state';

export const createActivities = ({
  accountService,
  connectionService,
  contactService,
  remoteService,
  opportunityService,
  leadService,
  userService,
  syncService,
  syncHistoryService,
  integrationService,
  applicationService,
}: {
  accountService: AccountService;
  connectionService: ConnectionService;
  contactService: ContactService;
  remoteService: RemoteService;
  opportunityService: OpportunityService;
  leadService: LeadService;
  userService: UserService;
  syncService: SyncService;
  syncHistoryService: SyncHistoryService;
  integrationService: IntegrationService;
  applicationService: ApplicationService;
}) => {
  return {
    getSync: createGetSync(syncService),
    updateSyncState: createUpdateSyncState(syncService),
    importRecords: createImportRecords(
      accountService,
      connectionService,
      contactService,
      remoteService,
      opportunityService,
      leadService,
      userService
    ),
    populateAssociations: createPopulateAssociations(accountService, contactService, opportunityService, leadService),
    logSyncStart: createLogSyncStart({ syncHistoryService }),
    logSyncFinish: createLogSyncFinish({ syncHistoryService }),
    maybeSendSyncFinishWebhook: createMaybeSendSyncFinishWebhook({
      connectionService,
      integrationService,
      applicationService,
    }),
  };
};
