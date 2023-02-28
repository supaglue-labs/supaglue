import { ContactService, LeadService, OpportunityService } from '@supaglue/core/services';

export type PopulateAssociationsArgs = {
  connectionId: string;
};

export function createPopulateAssociations(
  contactService: ContactService,
  opportunityService: OpportunityService,
  leadService: LeadService
) {
  return async function populateAssociations({ connectionId }: PopulateAssociationsArgs) {
    await Promise.all([
      contactService.updateDanglingAccounts(connectionId),
      opportunityService.updateDanglingAccounts(connectionId),
      leadService.updateDanglingAccounts(connectionId),
      leadService.updateDanglingContacts(connectionId),
    ]);
  };
}
