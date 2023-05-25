import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelV2 } from './base';

export type SnakecasedKeysSequence = SnakecasedKeys<Sequence>;
export type SnakecasedKeysSequenceV2 = SnakecasedKeys<SequenceV2>;
export type SnakecasedKeysSequenceV2WithTenant = SnakecasedKeysSequenceV2 & {
  provider_name: string;
  customer_id: string;
};

export type BaseSequence = BaseEngagementModel & {
  isEnabled: boolean;
  name: string | null;
  tags: string[];
  numSteps: number;
  scheduleCount: number;
  openCount: number;
  optOutCount: number;
  replyCount: number;
  clickCount: number;
};

// TODO: Rename/consolidate when we move entirely to managed syncs
export type Sequence = BaseSequence &
  BaseEngagementModelNonRemoteParams & {
    ownerId: string | null;
    rawData?: Record<string, any>;
  };

export type RemoteSequence = BaseEngagementModelV2 & {
  isEnabled: boolean;
  name: string | null;
  tags: string[];
  numSteps: number;
  scheduleCount: number;
  openCount: number;
  optOutCount: number;
  replyCount: number;
  clickCount: number;
  ownerId: string | null;
};

export type SequenceV2 = RemoteSequence;

export type RemoteSequenceTypes = {
  object: Sequence;
  createParams: never;
  updateParams: never;
};
