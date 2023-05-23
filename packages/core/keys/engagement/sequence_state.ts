import { SnakecasedKeysSimpleSequenceStateWithTenant } from '@supaglue/types/engagement';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedSequenceStateWithTenant = arrayOfAllKeys<SnakecasedKeysSimpleSequenceStateWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'remote_sequence_id',
  'remote_contact_id',
  'remote_mailbox_id',
  'state',
  'raw_data',
]);
