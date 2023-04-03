import type { CrmAccount, CrmContact, CrmEvent, CrmLead, CrmOpportunity, CrmUser } from '@supaglue/db';

export type CrmEventExpanded = CrmEvent & {
  account?: CrmAccount | null;
  contact?: CrmContact | null;
  lead?: CrmLead | null;
  opportunity?: CrmOpportunity | null;
  owner?: CrmUser | null;
};
