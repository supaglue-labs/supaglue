import { SnakecasedKeysCrmSimpleLeadWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedSimpleLeadWithTenant = arrayOfAllKeys<SnakecasedKeysCrmSimpleLeadWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
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
  'converted_remote_contact_id',
  'converted_remote_account_id',
  'remote_owner_id',
  'raw_data',
]);
