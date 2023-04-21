import { SnakecasedKeysUserWithTenant } from '@supaglue/types';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedUserWithTenant = arrayOfAllKeys<SnakecasedKeysUserWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'created_at',
  'updated_at',
  'was_deleted',
  'deleted_at',
  'detected_or_deleted_at',
  'last_modified_at',
  'name',
  'email',
  'is_active',
]);
