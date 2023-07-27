import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysSequenceState = SnakecasedKeys<SequenceState>;
export type SnakecasedKeysSequenceStateWithTenant = SnakecasedKeysSequenceState & SnakecasedEngagementTenantFields;

type CoreSequenceState = {
  state: string | null;
  contactId: string | null;
  sequenceId: string | null;
  // Required for Apollo and Outreach.
  mailboxId: string | null;
  // Required for Salesloft. Optional for Apollo.
  userId: string | null;
};

export type SequenceState = BaseEngagementModel & CoreSequenceState;

export type SequenceStateCreateParams = {
  contactId: string;
  sequenceId: string;
  // Required for Apollo and Outreach.
  mailboxId?: string;
  // Required for Salesloft. Optional for Apollo.
  userId?: string;
};

export type RemoteSequenceStateTypes = {
  object: SequenceState;
  createParams: SequenceStateCreateParams;
  updateParams: never;
};
