import { SnakecasedKeysMailboxWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedMailboxWithTenant = arrayOfAllKeys<SnakecasedKeysMailboxWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'email',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'user_id',
  'raw_data',
]);
