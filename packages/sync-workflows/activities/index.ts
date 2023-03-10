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
} from '@supaglue/core/services';
import { createDoSync } from './do_sync';
import { createLogSyncFinish } from './log_sync_finish';
import { createLogSyncStart } from './log_sync_start';
import { createMaybeSendSyncFinishWebhook } from './maybe_send_sync_finish_webhook';
import { createPopulateAssociations } from './populate_associations';

export const createActivities = ({
  accountService,
  connectionService,
  contactService,
  remoteService,
  opportunityService,
  leadService,
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
  syncHistoryService: SyncHistoryService;
  integrationService: IntegrationService;
  applicationService: ApplicationService;
}) => {
  return {
    doSync: createDoSync(
      accountService,
      connectionService,
      contactService,
      remoteService,
      opportunityService,
      leadService
    ),
    populateAssociations: createPopulateAssociations(contactService, opportunityService, leadService),
    logSyncStart: createLogSyncStart({ syncHistoryService }),
    logSyncFinish: createLogSyncFinish({ syncHistoryService }),
    maybeSendSyncFinishWebhook: createMaybeSendSyncFinishWebhook({
      connectionService,
      integrationService,
      applicationService,
    }),
  };
};
