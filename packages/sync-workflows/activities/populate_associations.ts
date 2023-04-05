import { AccountService, ContactService, EventService, LeadService, OpportunityService } from '@supaglue/core/services';
import { CommonModel } from '@supaglue/types';
import { Context } from '@temporalio/activity';

export type PopulateAssociationsArgs = {
  connectionId: string;
  originalMaxLastModifiedAtMsMap: Record<CommonModel, number>;
};

export function createPopulateAssociations(
  accountService: AccountService,
  contactService: ContactService,
  opportunityService: OpportunityService,
  leadService: LeadService,
  eventService: EventService
) {
  return async function populateAssociations({
    connectionId,
    originalMaxLastModifiedAtMsMap,
  }: PopulateAssociationsArgs) {
    // TODO: Parallelize / optimize? Keeping serial for now to be safe. Each command should run pretty quickly anyway.
    await contactService.updateDanglingAccounts(connectionId, new Date(originalMaxLastModifiedAtMsMap['contact']));
    Context.current().heartbeat();

    await opportunityService.updateDanglingAccounts(
      connectionId,
      new Date(originalMaxLastModifiedAtMsMap['opportunity'])
    );
    Context.current().heartbeat();

    await leadService.updateDanglingAccounts(connectionId, new Date(originalMaxLastModifiedAtMsMap['lead']));
    Context.current().heartbeat();

    await leadService.updateDanglingContacts(connectionId, new Date(originalMaxLastModifiedAtMsMap['lead']));
    Context.current().heartbeat();

    await accountService.updateDanglingOwners(connectionId, new Date(originalMaxLastModifiedAtMsMap['account']));
    Context.current().heartbeat();

    await contactService.updateDanglingOwners(connectionId, new Date(originalMaxLastModifiedAtMsMap['contact']));
    Context.current().heartbeat();

    await leadService.updateDanglingOwners(connectionId, new Date(originalMaxLastModifiedAtMsMap['lead']));
    Context.current().heartbeat();

    await opportunityService.updateDanglingOwners(
      connectionId,
      new Date(originalMaxLastModifiedAtMsMap['opportunity'])
    );
    Context.current().heartbeat();

    await eventService.updateDanglingOwners(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();

    await eventService.updateDanglingAccounts(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();

    await eventService.updateDanglingContacts(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();

    await eventService.updateDanglingLeads(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();

    await eventService.updateDanglingOpportunities(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();
  };
}
