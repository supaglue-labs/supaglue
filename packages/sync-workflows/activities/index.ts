import {
  ConnectionService,
  ProviderService,
  RemoteService,
  SyncConfigService,
  SyncHistoryService,
} from '@supaglue/core/services';
import {
  AccountService,
  ContactService,
  LeadService,
  OpportunityService,
  UserService,
} from '@supaglue/core/services/common_models/crm';
import {
  ContactService as EngagementContactService,
  MailboxService,
  SequenceService,
  SequenceStateService,
  UserService as EngagementUserService,
} from '@supaglue/core/services/common_models/engagement';
import { DestinationService } from '@supaglue/core/services/destination_service';
import type { ApplicationService, SyncService } from '../services';
import { createDoProcessSyncChanges } from './do_process_sync_changes';
import { createGetDestination } from './get_destination';
import { createGetSync } from './get_sync';
import { createGetSyncConfigBySyncId } from './get_sync_config_by_sync_id';
import { createImportRecords } from './import_records';
import { createLogSyncFinish } from './log_sync_finish';
import { createLogSyncStart } from './log_sync_start';
import { createMaybeSendSyncFinishWebhook } from './maybe_send_sync_finish_webhook';
import { createSetForceSyncFlag } from './set_force_sync_flag';
import { createSyncRawRecordsToDestination } from './sync_raw_records_to_destination';
import { createSyncRecordsToDestination } from './sync_records_to_destination';
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
  crm,
  engagement,
}: {
  connectionService: ConnectionService;
  remoteService: RemoteService;
  syncService: SyncService;
  syncHistoryService: SyncHistoryService;
  syncConfigService: SyncConfigService;
  providerService: ProviderService;
  applicationService: ApplicationService;
  destinationService: DestinationService;
  crm: {
    contactService: ContactService;
    accountService: AccountService;
    opportunityService: OpportunityService;
    leadService: LeadService;
    userService: UserService;
  };
  engagement: {
    contactService: EngagementContactService;
    userService: EngagementUserService;
    sequenceService: SequenceService;
    mailboxService: MailboxService;
    sequenceStateService: SequenceStateService;
  };
}) => {
  return {
    getSync: createGetSync(syncService),
    getDestination: createGetDestination(destinationService),
    getSyncConfigBySyncId: createGetSyncConfigBySyncId(syncConfigService),
    doProcessSyncChanges: createDoProcessSyncChanges(syncService),
    setForceSyncFlag: createSetForceSyncFlag(syncService),
    updateSyncState: createUpdateSyncState(syncService),
    importRecords: createImportRecords(connectionService, remoteService, applicationService, crm, engagement),
    syncRecordsToDestination: createSyncRecordsToDestination(
      connectionService,
      remoteService,
      destinationService,
      syncConfigService,
      applicationService
    ),
    syncRawRecordsToDestination: createSyncRawRecordsToDestination(
      connectionService,
      remoteService,
      destinationService,
      applicationService
    ),
    logSyncStart: createLogSyncStart({ syncHistoryService }),
    logSyncFinish: createLogSyncFinish({ syncHistoryService, applicationService, connectionService }),
    maybeSendSyncFinishWebhook: createMaybeSendSyncFinishWebhook({
      connectionService,
      providerService,
      applicationService,
    }),
  };
};
