import { CrmAccount, CrmUser } from '@supaglue/db';

export type CrmAccountModelExpanded = CrmAccount & {
  owner?: CrmUser | null;
};
