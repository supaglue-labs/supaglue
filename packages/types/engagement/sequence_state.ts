import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelRemoteOnlyParams } from './base';

export type SnakecasedKeysSequenceState = SnakecasedKeys<SequenceState>;

export type SnakecasedKeysSequenceStateWithTenant = SnakecasedKeysSequenceState & {
  provider_name: string;
  customer_id: string;
};

export type BaseSequenceState = BaseEngagementModel & {
  state: string | null;
};

export type SequenceState = BaseSequenceState &
  BaseEngagementModelNonRemoteParams & {
    contactId: string | null;
    sequenceId: string | null;
    mailboxId: string | null;
    rawData?: Record<string, any>;
  };

export type RemoteSequenceState = BaseSequenceState &
  BaseEngagementModelRemoteOnlyParams & {
    remoteContactId: string | null;
    remoteSequenceId: string | null;
    remoteMailboxId: string | null;
    rawData: Record<string, any>;
  };

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
