import { RemoteContactTypes } from './contact';
import { RemoteMailboxTypes } from './mailbox';
import { RemoteSequenceTypes } from './sequence';
import { RemoteUserTypes } from './user';

export const SUPPORTED_ENGAGEMENT_CONNECTIONS = ['outreach'] as const;

export type EngagementProviderName = (typeof SUPPORTED_ENGAGEMENT_CONNECTIONS)[number];
export type EngagementProviderCategory = 'engagement';

export const ENGAGEMENT_COMMON_MODELS = ['contact', 'user', 'sequence', 'mailbox'] as const;
export type EngagementCommonModelType = (typeof ENGAGEMENT_COMMON_MODELS)[number];

export type EngagementCommonModelTypeMap<T extends EngagementCommonModelType> = {
  contact: RemoteContactTypes;
  user: RemoteUserTypes;
  sequence: RemoteSequenceTypes;
  mailbox: RemoteMailboxTypes;
}[T];

export type CustomFields = Record<string, any>;

export * from './base';
export * from './common';
export * from './contact';
export * from './mailbox';
export * from './sequence';
export * from './user';
