import { SnakecasedKeysCrmAccountV2WithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedCrmAccountV2WithTenant = arrayOfAllKeys<SnakecasedKeysCrmAccountV2WithTenant>()([
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
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
  'raw_data',
]);
