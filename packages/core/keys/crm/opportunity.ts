import { SnakecasedKeysOpportunityV2WithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedOpportunityV2WithTenant = arrayOfAllKeys<SnakecasedKeysOpportunityV2WithTenant>()([
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
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
  'raw_data',
]);
