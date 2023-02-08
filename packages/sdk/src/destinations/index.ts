import { PostgresDestination } from './postgres';
import { WebhookDestination } from './webhook';

export * from './postgres';
export * from './webhook';

export type Destination = PostgresDestination | WebhookDestination;
