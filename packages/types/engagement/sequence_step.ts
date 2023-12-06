import type { EngagementV2 } from '@supaglue/sdk/v2/engagement';
import type { SnakecasedKeys } from '../snakecased_keys';
import type { BaseEngagementModel, SnakecasedEngagementTenantFields } from './base';

export type SnakecasedKeysSequenceStep = SnakecasedKeys<SequenceStep>;
export type SnakecasedKeysSequenceStepWithTenant = SnakecasedKeysSequenceStep & SnakecasedEngagementTenantFields;

type SequenceStepType = 'auto_email' | 'manual_email' | 'task' | 'call' | 'linkedin_send_message';

type CoreSequenceStep = {
  sequenceId?: string;
  type: SequenceStepType;
  name?: string;
  template?: Partial<SequenceTemplateId> & SequenceTemplateCreateParams;
  date?: string;
  intervalSeconds?: number;
  taskNote?: string;
};

export type SequenceStep = Partial<BaseEngagementModel> & CoreSequenceStep;

export type SequenceStepCreateParams = {
  /** Can be empty when creating steps together with Sequence */
  sequenceId?: string;
  order?: number;
  name?: string;
  date?: string;
  intervalSeconds?: number;
  isReply?: boolean;
  template?: SequenceTemplateId | SequenceTemplateCreateParams;
  type: SequenceStepType;
  taskNote?: string;
  customFields?: Record<string, unknown>;
};

export type SequenceTemplateId = {
  id: string;
};

export type SequenceTemplateCreateParams = {
  body: string;
  subject: string;
  name?: string;
  to?: string[];
  cc?: string[];
  bcc?: string[];
  customFields?: Record<string, unknown>;
};

type PatchSequenceStep = EngagementV2['paths']['/sequences/{sequence_id}/sequence_steps/{sequence_step_id}']['patch'];

export type RemoteSequenceStepTypes = {
  object: SequenceStep;
  listParams: never;
  createParams: SequenceStepCreateParams;
  upsertParams: never;
  /** Start of a new pattern to stop unnecessary camelCasing... */
  updateParams: PatchSequenceStep['parameters']['path'] &
    PatchSequenceStep['requestBody']['content']['application/json']['record'];
  searchParams: never;
};
