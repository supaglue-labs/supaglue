import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysSequenceStep = SnakecasedKeys<SequenceStep>;
export type SnakecasedKeysSequenceStepWithTenant = SnakecasedKeysSequenceStep & SnakecasedEngagementTenantFields;

type CoreSequenceStep = {
  sequenceId: string;
  name: string;
  // This is unused -- add more fields later.
};

export type SequenceStep = BaseEngagementModel & CoreSequenceStep;

export type SequenceStepCreateParams = {
  sequenceId: string;
  name: string;
  body?: string;
  daysAfter?: number;
  isReply?: boolean;
  subject?: string;
  templateName?: string;
  type: 'auto' | 'manual';
  customFields?: Record<string, unknown>;
};

export type RemoteSequenceStepTypes = {
  object: SequenceStep;
  createParams: SequenceStepCreateParams;
  updateParams: never;
};
