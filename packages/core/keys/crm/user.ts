import { SnakecasedKeysCrmUserV2WithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedCrmUserV2WithTenant = arrayOfAllKeys<SnakecasedKeysCrmUserV2WithTenant>()([
  '_supaglue_application_id',
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
  'last_modified_at',
  'name',
  'email',
  'is_active',
  'raw_data',
]);
