import type { CrmAccount, CrmContact, CrmUser } from '@supaglue/db';

export type CrmContactModelExpanded = CrmContact & {
  account?: CrmAccount | null;
  owner?: CrmUser | null;
};
