import { SnakecasedKeysEngagementSimpleUserWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedEngagementUserWithTenant = arrayOfAllKeys<SnakecasedKeysEngagementSimpleUserWithTenant>()([
  'provider_name',
  'customer_id',
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
