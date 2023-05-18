import { SnakecasedKeysEventWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedEventWithTenant = arrayOfAllKeys<SnakecasedKeysEventWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'type',
  'subject',
  'content',
  'start_time',
  'end_time',
  'owner_id',
  'owner',
  'account_id',
  'account',
  'contact_id',
  'contact',
  'lead_id',
  'lead',
  'opportunity_id',
  'opportunity',
  'raw_data',
]);
