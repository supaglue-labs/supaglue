import { SnakecasedKeysCrmSimpleUserWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedCrmSimpleUserWithTenant = arrayOfAllKeys<SnakecasedKeysCrmSimpleUserWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'name',
  'email',
  'is_active',
  'raw_data',
]);
