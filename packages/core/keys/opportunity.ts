import { SnakecasedKeysOpportunityWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedOpportunityWithTenant = arrayOfAllKeys<SnakecasedKeysOpportunityWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'created_at',
  'updated_at',
  'was_deleted',
  'deleted_at',
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
