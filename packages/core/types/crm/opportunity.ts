import type { CrmAccount, CrmOpportunity, CrmUser } from '@supaglue/db';

export type CrmOpportunityModelExpanded = CrmOpportunity & {
  account?: CrmAccount | null;
  owner?: CrmUser | null;
};
