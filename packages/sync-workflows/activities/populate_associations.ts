import { AccountService, ContactService, EventService, LeadService, OpportunityService } from '@supaglue/core/services';
import { Context } from '@temporalio/activity';

export type PopulateAssociationsArgs = {
  connectionId: string;
};

export function createPopulateAssociations(
  accountService: AccountService,
  contactService: ContactService,
  opportunityService: OpportunityService,
  leadService: LeadService,
  eventService: EventService
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

    await accountService.updateDanglingOwners(connectionId);
    Context.current().heartbeat();

    await contactService.updateDanglingOwners(connectionId);
    Context.current().heartbeat();

    await leadService.updateDanglingOwners(connectionId);
    Context.current().heartbeat();

    await opportunityService.updateDanglingOwners(connectionId);
    Context.current().heartbeat();

    await eventService.updateDanglingOwners(connectionId);
    Context.current().heartbeat();

    await eventService.updateDanglingAccounts(connectionId);
    Context.current().heartbeat();

    await eventService.updateDanglingContacts(connectionId);
    Context.current().heartbeat();

    await eventService.updateDanglingLeads(connectionId);
    Context.current().heartbeat();

    await eventService.updateDanglingOpportunities(connectionId);
    Context.current().heartbeat();
  };
}
