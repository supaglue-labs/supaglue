import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelV2 } from './base';

export type SnakecasedKeysSequenceState = SnakecasedKeys<SequenceState>;
export type SnakecasedKeysSequenceStateV2 = SnakecasedKeys<SequenceStateV2>;
export type SnakecasedKeysSequenceStateV2WithTenant = SnakecasedKeysSequenceStateV2 & {
  provider_name: string;
  customer_id: string;
};

export type BaseSequenceState = BaseEngagementModel & {
  state: string | null;
};

// TODO: Rename/consolidate when we move entirely to managed syncs
export type SequenceState = BaseSequenceState &
  BaseEngagementModelNonRemoteParams & {
    contactId: string | null;
    sequenceId: string | null;
    mailboxId: string | null;
    rawData?: Record<string, any>;
  };

export type RemoteSequenceState = BaseEngagementModelV2 & {
  state: string | null;
  contactId: string | null;
  sequenceId: string | null;
  mailboxId: string | null;
};

export type SequenceStateV2 = RemoteSequenceState;

export type SequenceStateCreateParams = {
  contactId: string;
  sequenceId: string;
  mailboxId: string;
};
export type RemoteSequenceStateCreateParams = {
  remoteContactId: string;
  remoteSequenceId: string;
  remoteMailboxId: string;
};

export type RemoteSequenceStateTypes = {
  object: RemoteSequenceState;
  createParams: RemoteSequenceStateCreateParams;
  updateParams: never;
};
