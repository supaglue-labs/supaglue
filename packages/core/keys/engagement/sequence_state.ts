import { SnakecasedKeysSequenceStateV2WithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedSequenceStateV2WithTenant = arrayOfAllKeys<SnakecasedKeysSequenceStateV2WithTenant>()([
  '_supaglue_application_id',
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
  'last_modified_at',
  'sequence_id',
  'contact_id',
  'mailbox_id',
  'state',
  'raw_data',
]);
