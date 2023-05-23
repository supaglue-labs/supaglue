import { SnakecasedKeysSimpleOpportunityWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedSimpleOpportunityWithTenant = arrayOfAllKeys<SnakecasedKeysSimpleOpportunityWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'last_modified_at',
  'name',
  'description',
  'amount',
  'stage',
  'status',
  'close_date',
  'pipeline',
  'remote_account_id',
  'remote_owner_id',
  'last_activity_at',
  'raw_data',
]);
