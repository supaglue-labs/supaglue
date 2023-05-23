import { SnakecasedKeysEngagementUserWithTenant } from '@supaglue/types/Engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedEngagementUserWithTenant = arrayOfAllKeys<SnakecasedKeysEngagementUserWithTenant>()([
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
  'email',
  'raw_data',
]);
