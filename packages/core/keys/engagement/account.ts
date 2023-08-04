import type { SnakecasedKeysEngagementAccountWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedEngagementAccountWithTenant = arrayOfAllKeys<SnakecasedKeysEngagementAccountWithTenant>()([
  '_supaglue_application_id',
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  '_supaglue_emitted_at',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
  'last_modified_at',
  'name',
  'domain',
  'owner_id',
  'raw_data',
]);
