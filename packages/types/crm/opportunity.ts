import type { BaseCrmModelV2, CustomFields, SnakecasedCrmTenantFields } from '.';
import type { EqualsFilter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';

export const OPPORTUNITY_STATUSES = ['OPEN', 'WON', 'LOST'] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

export type SnakecasedKeysOpportunityV2 = SnakecasedKeys<OpportunityV2>;
export type SnakecasedKeysOpportunityV2WithTenant = SnakecasedKeysOpportunityV2 & SnakecasedCrmTenantFields;

type CoreOpportunity = {
  name: string | null;
  description: string | null;
  amount: number | null;
  stage: string | null;
  status: OpportunityStatus | null;
  lastActivityAt: Date | null;
  closeDate: Date | null;
  pipeline: string | null;
  accountId: string | null;
  ownerId: string | null;
};

export type OpportunityV2 = BaseCrmModelV2 & CoreOpportunity;

export type OpportunityCreateParams = Partial<CoreOpportunity> & {
  customFields?: CustomFields;
};

export type OpportunityUpdateParams = OpportunityCreateParams & {
  id: string;
};

export type OpportunityFilters = {
  accountId?: EqualsFilter;
  remoteId?: EqualsFilter;
};

export type RemoteOpportunityTypes = {
  object: OpportunityV2;
  createParams: OpportunityCreateParams;
  updateParams: OpportunityUpdateParams;
};
