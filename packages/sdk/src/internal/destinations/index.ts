import { PostgresDestination, WebhookDestination } from '@supaglue/types';

export * from './postgres';
export * from './webhook';

export type InternalDestination = PostgresDestination | WebhookDestination;
