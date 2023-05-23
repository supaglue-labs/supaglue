import { SnakecasedKeysSimpleAccountWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedSimpleAccountWithTenant = arrayOfAllKeys<SnakecasedKeysSimpleAccountWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
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
  'remote_owner_id',
  'raw_data',
]);
