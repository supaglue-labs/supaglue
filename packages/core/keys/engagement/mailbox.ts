import { SnakecasedKeysSimpleMailboxWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedMailboxWithTenant = arrayOfAllKeys<SnakecasedKeysSimpleMailboxWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'email',
  'remote_user_id',
  'raw_data',
]);
