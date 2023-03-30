import type { CrmAccount, CrmContact, CrmUser } from '@supaglue/db';

export type CrmContactExpanded = CrmContact & {
  account?: CrmAccount | null;
  owner?: CrmUser | null;
};
