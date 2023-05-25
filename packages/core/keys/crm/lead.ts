import { SnakecasedKeysCrmLeadV2WithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedLeadV2WithTenant = arrayOfAllKeys<SnakecasedKeysCrmLeadV2WithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'created_at',
  'updated_at',
  'is_deleted',
  'last_modified_at',
  'lead_source',
  'title',
  'company',
  'first_name',
  'last_name',
  'addresses',
  'email_addresses',
  'phone_numbers',
  'converted_date',
  'converted_contact_id',
  'converted_account_id',
  'owner_id',
  'raw_data',
]);
