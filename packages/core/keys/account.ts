import { SnakecasedKeysAccountWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedAccountWithTenant = arrayOfAllKeys<SnakecasedKeysAccountWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'created_at',
  'updated_at',
  'was_deleted',
  'deleted_at',
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
