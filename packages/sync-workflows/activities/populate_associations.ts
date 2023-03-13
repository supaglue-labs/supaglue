import { ContactService, LeadService, OpportunityService } from '@supaglue/core/services';
import { Context } from '@temporalio/activity';

export type PopulateAssociationsArgs = {
  connectionId: string;
};

export function createPopulateAssociations(
  contactService: ContactService,
  opportunityService: OpportunityService,
  leadService: LeadService
) {
  return async function populateAssociations({ connectionId }: PopulateAssociationsArgs) {
    // TODO: Parallelize / optimize? Keeping serial for now to be safe. Each command should run pretty quickly anyway.
    await contactService.updateDanglingAccounts(connectionId);
    Context.current().heartbeat();

    await opportunityService.updateDanglingAccounts(connectionId);
    Context.current().heartbeat();

    await leadService.updateDanglingAccounts(connectionId);
    Context.current().heartbeat();

    await leadService.updateDanglingContacts(connectionId);
    Context.current().heartbeat();
  };
}
