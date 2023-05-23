import { SnakecasedKeysCrmSimpleContactWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedCrmSimpleContactWithTenant = arrayOfAllKeys<SnakecasedKeysCrmSimpleContactWithTenant>()([
  'provider_name',
  'customer_id',
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
  'remote_account_id',
  'remote_owner_id',
  'last_activity_at',
  'raw_data',
]);
