import { SnakecasedKeys } from '../snakecased_keys';
import { BaseEngagementModelV2, SnakecasedEngagementTenantFields } from './base';

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

export type SequenceV2 = BaseEngagementModelV2 & CoreSequence;

export type RemoteSequenceTypes = {
  object: SequenceV2;
  createParams: never;
  updateParams: never;
};
