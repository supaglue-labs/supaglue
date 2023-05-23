import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelRemoteOnlyParams } from './base';

export type SnakecasedKeysSequence = SnakecasedKeys<Sequence>;

export type SnakecasedKeysSequenceWithTenant = SnakecasedKeysSequence & {
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

export type Sequence = BaseSequence &
  BaseEngagementModelNonRemoteParams & {
    ownerId: string | null;
    rawData?: Record<string, any>;
  };

export type RemoteSequence = BaseSequence &
  BaseEngagementModelRemoteOnlyParams & {
    remoteOwnerId: string | null;
    rawData: Record<string, any>;
  };

export type RemoteSequenceTypes = {
  object: Sequence;
  createParams: never;
  updateParams: never;
};
