import {
  AccountService,
  ConnectionService,
  ContactService,
  IntegrationService,
  LeadService,
  OpportunityService,
} from '@supaglue/core/services';
import { createDoSync } from './do_sync';
import { createPopulateAssociations } from './populate_associations';

export const createActivities = ({
  accountService,
  connectionService,
  contactService,
  integrationService,
  opportunityService,
  leadService,
}: {
  accountService: AccountService;
  connectionService: ConnectionService;
  contactService: ContactService;
  integrationService: IntegrationService;
  opportunityService: OpportunityService;
  leadService: LeadService;
}) => {
  return {
    doSync: createDoSync(
      accountService,
      connectionService,
      contactService,
      integrationService,
      opportunityService,
      leadService
    ),
    populateAssociations: createPopulateAssociations(contactService, opportunityService, leadService),
  };
};
