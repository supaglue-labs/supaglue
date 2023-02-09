import { PostgresDestination } from './postgres';
import { WebhookDestination } from './webhook';

export * from './postgres';
export * from './webhook';

export type InternalDestination = PostgresDestination | WebhookDestination;
