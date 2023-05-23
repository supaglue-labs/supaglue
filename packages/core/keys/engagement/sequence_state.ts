import { SnakecasedKeysSequenceStateWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedSequenceStateWithTenant = arrayOfAllKeys<SnakecasedKeysSequenceStateWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'remote_id',
  'sequence_id',
  'contact_id',
  'mailbox_id',
  'state',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'raw_data',
]);
