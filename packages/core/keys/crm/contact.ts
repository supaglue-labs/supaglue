import { SnakecasedKeysCrmContactWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedCrmContactWithTenant = arrayOfAllKeys<SnakecasedKeysCrmContactWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'first_name',
  'last_name',
  'addresses',
  'email_addresses',
  'phone_numbers',
  'lifecycle_stage',
  'account_id',
  'account',
  'owner_id',
  'owner',
  'last_activity_at',
  'raw_data',
]);
