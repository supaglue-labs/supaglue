import { SnakecasedKeysOpportunityWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedOpportunityWithTenant = arrayOfAllKeys<SnakecasedKeysOpportunityWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
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
  'account_id',
  'account',
  'owner_id',
  'owner',
  'last_activity_at',
  'raw_data',
]);
