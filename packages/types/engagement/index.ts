import type { RemoteAccountTypes } from './account';
import type { RemoteContactTypes } from './contact';
import type { RemoteMailboxTypes } from './mailbox';
import type { RemoteSequenceTypes } from './sequence';
import type { RemoteSequenceStateTypes } from './sequence_state';
import type { RemoteSequenceStepTypes } from './sequence_step';
import type { RemoteUserTypes } from './user';

export const SUPPORTED_ENGAGEMENT_PROVIDERS = ['outreach', 'apollo', 'salesloft'] as const;

export type EngagementProviderName = (typeof SUPPORTED_ENGAGEMENT_PROVIDERS)[number];
export type EngagementProviderCategory = 'engagement';

export const ENGAGEMENT_COMMON_OBJECT_TYPES = [
  'contact',
  'user',
  'sequence',
  'mailbox',
  'sequence_state',
  'account',
  'sequence_step',
] as const;
export type EngagementCommonObjectType = (typeof ENGAGEMENT_COMMON_OBJECT_TYPES)[number];

export type EngagementCommonObjectTypeMap<T extends EngagementCommonObjectType> = {
  contact: RemoteContactTypes;
  user: RemoteUserTypes;
  sequence: RemoteSequenceTypes;
  mailbox: RemoteMailboxTypes;
  sequence_state: RemoteSequenceStateTypes;
  account: RemoteAccountTypes;
  sequence_step: RemoteSequenceStepTypes;
}[T];

export type CustomFields = Record<string, any>;

export * from './account';
export * from './base';
export * from './common';
export * from './contact';
export * from './mailbox';
export * from './sequence';
export * from './sequence_state';
export * from './user';
