import { SnakecasedKeysEngagementSimpleContactWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedEngagementContactWithTenant =
  arrayOfAllKeys<SnakecasedKeysEngagementSimpleContactWithTenant>()([
    'provider_name',
    'customer_id',
    'remote_id',
    'remote_created_at',
    'remote_updated_at',
    'remote_was_deleted',
    'last_modified_at',
    'first_name',
    'last_name',
    'job_title',
    'address',
    'email_addresses',
    'phone_numbers',
    'remote_owner_id',
    'open_count',
    'click_count',
    'reply_count',
    'bounced_count',
    'raw_data',
  ]);
