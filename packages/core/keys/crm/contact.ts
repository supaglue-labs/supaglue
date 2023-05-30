import { SnakecasedKeysCrmContactV2WithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedCrmContactV2WithTenant = arrayOfAllKeys<SnakecasedKeysCrmContactV2WithTenant>()([
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
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
  'raw_data',
]);
