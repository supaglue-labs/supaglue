import { SnakecasedKeysOpportunityWithTenant } from '@supaglue/types';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedOpportunityWithTenant = arrayOfAllKeys<SnakecasedKeysOpportunityWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'remote_deleted_at',
  'detected_or_remote_deleted_at',
  'last_modified_at',
  'name',
  'description',
  'amount',
  'stage',
  'status',
  'close_date',
  'pipeline',
  'account_id',
  'owner_id',
  'last_activity_at',
]);
