import { SnakecasedKeysAccountWithTenant } from '@supaglue/types';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedAccountWithTenant = arrayOfAllKeys<SnakecasedKeysAccountWithTenant>()([
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
  'description',
  'industry',
  'website',
  'number_of_employees',
  'addresses',
  'phone_numbers',
  'last_activity_at',
  'lifecycle_stage',
  'owner_id',
]);
