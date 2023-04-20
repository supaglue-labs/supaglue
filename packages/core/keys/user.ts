import { SnakecasedKeysUserWithTenant } from '@supaglue/types';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedUserWithTenant = arrayOfAllKeys<SnakecasedKeysUserWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'remote_deleted_at',
  'detected_or_remote_deleted_at',
  'last_modified_at',
  'name',
  'email',
  'is_active',
]);
