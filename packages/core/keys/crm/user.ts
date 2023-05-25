import { SnakecasedKeysCrmUserV2WithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedCrmUserV2WithTenant = arrayOfAllKeys<SnakecasedKeysCrmUserV2WithTenant>()([
  'provider_name',
  'customer_id',
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
