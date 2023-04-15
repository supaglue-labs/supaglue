import { logger } from '@supaglue/core/lib';
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
    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...contactService.updateDanglingAccounts'
    );

    // TODO: Parallelize / optimize? Keeping serial for now to be safe. Each command should run pretty quickly anyway.
    await contactService.updateDanglingAccounts(connectionId, new Date(originalMaxLastModifiedAtMsMap['contact']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...opportunityService.updateDanglingAccounts'
    );

    await opportunityService.updateDanglingAccounts(
      connectionId,
      new Date(originalMaxLastModifiedAtMsMap['opportunity'])
    );
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...leadService.updateDanglingAccounts'
    );

    await leadService.updateDanglingAccounts(connectionId, new Date(originalMaxLastModifiedAtMsMap['lead']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...leadService.updateDanglingContacts'
    );

    await leadService.updateDanglingContacts(connectionId, new Date(originalMaxLastModifiedAtMsMap['lead']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...accountService.updateDanglingOwners'
    );

    await accountService.updateDanglingOwners(connectionId, new Date(originalMaxLastModifiedAtMsMap['account']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...contactService.updateDanglingOwners'
    );

    await contactService.updateDanglingOwners(connectionId, new Date(originalMaxLastModifiedAtMsMap['contact']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...leadService.updateDanglingOwners'
    );

    await leadService.updateDanglingOwners(connectionId, new Date(originalMaxLastModifiedAtMsMap['lead']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...opportunityService.updateDanglingOwners'
    );

    await opportunityService.updateDanglingOwners(
      connectionId,
      new Date(originalMaxLastModifiedAtMsMap['opportunity'])
    );
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...eventService.updateDanglingOwners'
    );

    await eventService.updateDanglingOwners(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...eventService.updateDanglingAccounts'
    );

    await eventService.updateDanglingAccounts(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...eventService.updateDanglingContacts'
    );

    await eventService.updateDanglingContacts(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...eventService.updateDanglingLeads'
    );

    await eventService.updateDanglingLeads(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();

    logger.info(
      { connectionId, originalMaxLastModifiedAtMsMap },
      'Populating associations...eventService.updateDanglingOpportunities'
    );

    await eventService.updateDanglingOpportunities(connectionId, new Date(originalMaxLastModifiedAtMsMap['event']));
    Context.current().heartbeat();

    logger.info({ connectionId, originalMaxLastModifiedAtMsMap }, 'Populating associations...done');
  };
}
