import type { BaseCrmModel, CustomFields, SnakecasedCrmTenantFields } from '.';
import type { EqualsFilter } from '../filter';
import type { SnakecasedKeys } from '../snakecased_keys';

export const OPPORTUNITY_STATUSES = ['OPEN', 'WON', 'LOST'] as const;
export type OpportunityStatus = (typeof OPPORTUNITY_STATUSES)[number];

/* @todo: rename to `SnakecasedKeysCrmOpportunity` for consistency with others */
export type SnakecasedKeysOpportunity = SnakecasedKeys<Opportunity>;
export type SnakecasedKeysOpportunityWithTenant = SnakecasedKeysOpportunity & SnakecasedCrmTenantFields;

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

export type Opportunity = BaseCrmModel & CoreOpportunity;

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
  object: Opportunity;
  createParams: OpportunityCreateParams;
  updateParams: OpportunityUpdateParams;
  upsertParams: never;
};
