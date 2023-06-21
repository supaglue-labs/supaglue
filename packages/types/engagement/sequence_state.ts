import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysSequenceState = SnakecasedKeys<SequenceState>;
export type SnakecasedKeysSequenceStateWithTenant = SnakecasedKeysSequenceState & SnakecasedEngagementTenantFields;

type CoreSequenceState = {
  state: string | null;
  contactId: string | null;
  sequenceId: string | null;
  mailboxId: string | null;
};

export type SequenceState = BaseEngagementModel & CoreSequenceState;

export type SequenceStateCreateParams = {
  contactId: string;
  sequenceId: string;
  mailboxId: string;
};

export type RemoteSequenceStateTypes = {
  object: SequenceState;
  createParams: SequenceStateCreateParams;
  updateParams: never;
};
