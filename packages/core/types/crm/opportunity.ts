import type { CrmAccount, CrmOpportunity, CrmUser } from '@supaglue/db';

export type CrmOpportunityExpanded = CrmOpportunity & {
  account?: CrmAccount | null;
  owner?: CrmUser | null;
};
