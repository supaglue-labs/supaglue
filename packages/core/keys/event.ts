import { SnakecasedKeysEventWithTenant } from '@supaglue/types';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedEventWithTenant = arrayOfAllKeys<SnakecasedKeysEventWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'remote_deleted_at',
  'detected_or_remote_deleted_at',
  'last_modified_at',
  'type',
  'subject',
  'content',
  'start_time',
  'end_time',
  'owner_id',
  'account_id',
  'contact_id',
  'lead_id',
  'opportunity_id',
]);
