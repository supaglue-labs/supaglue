import {
  AccountService,
  ConnectionService,
  ContactService,
  LeadService,
  OpportunityService,
  RemoteService,
  SyncHistoryService,
} from '@supaglue/core/services';
import { createDoSync } from './do_sync';
import { createLogSyncFinish } from './log_sync_finish';
import { createLogSyncStart } from './log_sync_start';
import { createPopulateAssociations } from './populate_associations';

export const createActivities = ({
  accountService,
  connectionService,
  contactService,
  remoteService,
  opportunityService,
  leadService,
  syncHistoryService,
}: {
  accountService: AccountService;
  connectionService: ConnectionService;
  contactService: ContactService;
  remoteService: RemoteService;
  opportunityService: OpportunityService;
  leadService: LeadService;
  syncHistoryService: SyncHistoryService;
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
  };
};
