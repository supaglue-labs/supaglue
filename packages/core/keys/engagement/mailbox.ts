import type { SnakecasedKeysMailboxWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedMailboxWithTenant = arrayOfAllKeys<SnakecasedKeysMailboxWithTenant>()([
  '_supaglue_application_id',
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  '_supaglue_emitted_at',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
  'last_modified_at',
  'email',
  'user_id',
  'raw_data',
]);
