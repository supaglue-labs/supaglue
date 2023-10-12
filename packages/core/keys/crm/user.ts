import type { SnakecasedKeysCrmUserWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedCrmUserWithTenant = arrayOfAllKeys<SnakecasedKeysCrmUserWithTenant>()([
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
  'name',
  'email',
  'is_active',
  'raw_data',
]);
