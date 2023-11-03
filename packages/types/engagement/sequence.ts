import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';
import type { SequenceStepCreateParams } from './sequence_step';

export type SnakecasedKeysSequence = SnakecasedKeys<Sequence>;
export type SnakecasedKeysSequenceWithTenant = SnakecasedKeysSequence & SnakecasedEngagementTenantFields;

type CoreSequence = {
  isEnabled: boolean;
  name: string | null;
  tags: string[];
  numSteps: number;
  metrics: Record<string, number | null | undefined>;
  ownerId: string | null;
  shareType: 'team' | 'private';
  isArchived: boolean | undefined;
};

export type Sequence = BaseEngagementModel & CoreSequence;

export type RemoteSequenceTypes = {
  object: Sequence;
  createParams: SequenceCreateParams;
  updateParams: never;
};

export type SequenceCreateParams = {
  name: string;
  ownerId?: string;
  tags?: string[];
  type: 'team' | 'private';
  steps?: SequenceStepCreateParams[];
  customFields?: Record<string, unknown>;
};
