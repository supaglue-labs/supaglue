import { SnakecasedKeysEngagementUserV2WithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedEngagementUserV2WithTenant = arrayOfAllKeys<SnakecasedKeysEngagementUserV2WithTenant>()([
  'provider_name',
  'customer_id',
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
