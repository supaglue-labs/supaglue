import { SnakecasedKeysEngagementUserWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedEngagementUserWithTenant = arrayOfAllKeys<SnakecasedKeysEngagementUserWithTenant>()([
  '_supaglue_application_id',
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  '_supaglue_emitted_at',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
  'last_modified_at',
  'first_name',
  'last_name',
  'email',
  'raw_data',
]);
