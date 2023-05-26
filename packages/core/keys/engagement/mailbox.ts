import { SnakecasedKeysMailboxV2WithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedMailboxV2WithTenant = arrayOfAllKeys<SnakecasedKeysMailboxV2WithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
  'last_modified_at',
  'email',
  'user_id',
  'raw_data',
]);
