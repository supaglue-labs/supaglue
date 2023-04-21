import { SnakecasedKeysEventWithTenant } from '@supaglue/types';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedEventWithTenant = arrayOfAllKeys<SnakecasedKeysEventWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'created_at',
  'updated_at',
  'was_deleted',
  'deleted_at',
  'detected_or_deleted_at',
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
