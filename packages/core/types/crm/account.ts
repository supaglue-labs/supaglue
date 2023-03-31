import { CrmAccount, CrmUser } from '@supaglue/db';

export type CrmAccountExpanded = CrmAccount & {
  owner?: CrmUser | null;
};
