import type { CrmAccount, CrmContact, CrmLead, CrmUser } from '@supaglue/db';

export type CrmLeadModelExpanded = CrmLead & {
  convertedAccount?: CrmAccount | null;
  convertedContact?: CrmContact | null;
  owner?: CrmUser | null;
};
