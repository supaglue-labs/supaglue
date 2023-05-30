import { SnakecasedKeysEngagementContactV2WithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedEngagementContactV2WithTenant =
  arrayOfAllKeys<SnakecasedKeysEngagementContactV2WithTenant>()([
    '_supaglue_provider_name',
    '_supaglue_customer_id',
    'id',
    'created_at',
    'updated_at',
    'is_deleted',
    'last_modified_at',
    'first_name',
    'last_name',
    'job_title',
    'address',
    'email_addresses',
    'phone_numbers',
    'owner_id',
    'open_count',
    'click_count',
    'reply_count',
    'bounced_count',
    'raw_data',
  ]);
