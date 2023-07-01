import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysSequence = SnakecasedKeys<Sequence>;
export type SnakecasedKeysSequenceWithTenant = SnakecasedKeysSequence & SnakecasedEngagementTenantFields;

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

export type Sequence = BaseEngagementModel & CoreSequence;

export type RemoteSequenceTypes = {
  object: Sequence;
  createParams: never;
  updateParams: never;
};
