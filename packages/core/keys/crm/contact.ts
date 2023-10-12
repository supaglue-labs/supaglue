import type { SnakecasedKeysCrmContactWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedCrmContactWithTenant = arrayOfAllKeys<SnakecasedKeysCrmContactWithTenant>()([
  '_supaglue_application_id',
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  '_supaglue_emitted_at',
  '_supaglue_unified_data',
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
