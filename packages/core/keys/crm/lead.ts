import { SnakecasedKeysLeadWithTenant } from '@supaglue/types/crm';
import { arrayOfAllKeys } from '../util';

export const keysOfSnakecasedLeadWithTenant = arrayOfAllKeys<SnakecasedKeysLeadWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
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
  'converted_contact_id',
  'converted_contact',
  'converted_account_id',
  'converted_account',
  'owner_id',
  'owner',
  'raw_data',
]);
