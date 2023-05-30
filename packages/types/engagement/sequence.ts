import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModel, BaseEngagementModelV2, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysSequence = SnakecasedKeys<Sequence>;
export type SnakecasedKeysSequenceV2 = SnakecasedKeys<SequenceV2>;
export type SnakecasedKeysSequenceV2WithTenant = SnakecasedKeysSequenceV2 & SnakecasedEngagementTenantFields;

type CoreSequence = {
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

// TODO: Rename/consolidate when we move entirely to managed syncs
export type Sequence = BaseEngagementModel & CoreSequence;

export type SequenceV2 = BaseEngagementModelV2 & CoreSequence;

export type RemoteSequenceTypes = {
  object: Sequence;
  createParams: never;
  updateParams: never;
};
