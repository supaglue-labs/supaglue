import { SnakecasedKeysSequenceWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedSequenceWithTenant = arrayOfAllKeys<SnakecasedKeysSequenceWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'name',
  'tags',
  'num_steps',
  'schedule_count',
  'click_count',
  'reply_count',
  'open_count',
  'opt_out_count',
  'is_enabled',
  'remote_id',
  'owner_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'raw_data',
]);
