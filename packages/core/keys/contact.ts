import { SnakecasedKeysContactWithTenant } from '@supaglue/types';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedContactWithTenant = arrayOfAllKeys<SnakecasedKeysContactWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'remote_deleted_at',
  'detected_or_remote_deleted_at',
  'last_modified_at',
  'first_name',
  'last_name',
  'addresses',
  'email_addresses',
  'phone_numbers',
  'lifecycle_stage',
  'account_id',
  'owner_id',
  'last_activity_at',
]);
