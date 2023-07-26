import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysSequence = SnakecasedKeys<Sequence>;
export type SnakecasedKeysSequenceWithTenant = SnakecasedKeysSequence & SnakecasedEngagementTenantFields;

type CoreSequence = {
  isEnabled: boolean;
  name: string | null;
  tags: string[];
  numSteps: number;
  metrics: Record<string, number | null | undefined>;
  ownerId: string | null;
};

export type Sequence = BaseEngagementModel & CoreSequence;

export type RemoteSequenceTypes = {
  object: Sequence;
  createParams: never;
  updateParams: never;
};
