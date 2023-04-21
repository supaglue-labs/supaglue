import { BaseCrmModel, CustomFields } from '.';
import { SnakecasedKeys } from '../snakecased_keys';

export const OPPORTUNITY_STATUSES = ['OPEN', 'WON', 'LOST'] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export type SnakecasedKeysOpportunity = SnakecasedKeys<Opportunity>;

export type SnakecasedKeysOpportunityWithTenant = SnakecasedKeysOpportunity & {
  provider_name: string;
  customer_id: string;
};

export type Opportunity = BaseCrmModel & {
  name: string | null;
  description: string | null;
  amount: number | null;
  stage: string | null;
  status: OpportunityStatus | null;
  closeDate: Date | null;
  pipeline: string | null;

  accountId: string | null;
  ownerId: string | null;

  lastActivityAt: Date | null;
};

export type OpportunityCreateParams = {
  name?: string | null;
  description?: string | null;
  amount?: number | null;
  stage?: string | null;
  closeDate?: Date | null;
  pipeline?: string | null;

  accountId?: string | null;
  ownerId?: string | null;

  customFields?: CustomFields;
};

export type OpportunityUpdateParams = OpportunityCreateParams & {
  remoteId: string;
};

export type OpportunityTypes = {
  object: Opportunity;
  createParams: OpportunityCreateParams;
  updateParams: OpportunityUpdateParams;
};
