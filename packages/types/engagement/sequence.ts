import { BaseEngagementModel, BaseEngagementModelNonRemoteParams, BaseEngagementModelRemoteOnlyParams } from './base';

export type BaseSequence = BaseEngagementModel & {
  isEnabled: boolean | null;
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
