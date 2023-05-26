import { SnakecasedKeysSequenceStateV2WithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedSequenceStateV2WithTenant = arrayOfAllKeys<SnakecasedKeysSequenceStateV2WithTenant>()([
  'provider_name',
  'customer_id',
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
