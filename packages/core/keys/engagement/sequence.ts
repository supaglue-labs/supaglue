import { SnakecasedKeysSimpleSequenceWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedSequenceWithTenant = arrayOfAllKeys<SnakecasedKeysSimpleSequenceWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'remote_owner_id',
  'name',
  'tags',
  'num_steps',
  'schedule_count',
  'click_count',
  'reply_count',
  'open_count',
  'opt_out_count',
  'is_enabled',
  'raw_data',
]);
