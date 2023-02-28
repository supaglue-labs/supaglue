import { CrmAccount, CrmOpportunity } from '@prisma/client';
import { Account } from './account';

export type CrmOpportunityExpanded = CrmOpportunity & {
  account?: CrmAccount | null;
};

export const OPPORTUNITY_STATUSES = ['OPEN', 'WON', 'LOST'] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

type BaseOpportunity = {
  name: string | null;
  description: string | null;
  amount: number | null;
  owner: string | null;
  stage: string | null;
  status: OpportunityStatus | null;
  lastActivityAt: Date | null;
  closeDate: Date | null;
};

export type Opportunity = BaseOpportunity & {
  accountId: string | null;
  account?: Account;
  createdAt: Date | null;
  updatedAt: Date | null;
  wasDeleted: boolean;
  id: string;
  // Support field mappings + remote data etc
};

export type RemoteOpportunity = BaseOpportunity & {
  remoteId: string;
  remoteAccountId: string | null;
  remoteCreatedAt: Date | null;
  remoteUpdatedAt: Date | null;
  remoteWasDeleted: boolean;
};

type BaseOpportunityCreateParams = {
  amount?: number | null;
  closeDate?: Date | null;
  description?: string | null;

  // TODO: Need extra permissions to create/update this derived field in SF
  // lastActivityAt?: Date | null;

  name?: string | null;
  stage?: string | null;
};

export type OpportunityCreateParams = BaseOpportunityCreateParams;
export type RemoteOpportunityCreateParams = BaseOpportunityCreateParams;

export type OpportunityUpdateParams = OpportunityCreateParams & {
  id: string;
};

export type RemoteOpportunityUpdateParams = RemoteOpportunityCreateParams & {
  remoteId: string;
};

export type OpportunitySyncUpsertParams = RemoteOpportunity & {
  customerId: string;
  connectionId: string;
};
