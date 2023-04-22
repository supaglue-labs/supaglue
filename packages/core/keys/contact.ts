import { SnakecasedKeysContactWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedContactWithTenant = arrayOfAllKeys<SnakecasedKeysContactWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'created_at',
  'updated_at',
  'was_deleted',
  'deleted_at',
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
