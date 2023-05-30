import { SnakecasedKeysMailboxV2WithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedMailboxV2WithTenant = arrayOfAllKeys<SnakecasedKeysMailboxV2WithTenant>()([
  '_supaglue_application_id',
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
  'last_modified_at',
  'email',
  'user_id',
  'raw_data',
]);
