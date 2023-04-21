import { SnakecasedKeysLeadWithTenant } from '@supaglue/types';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedLeadWithTenant = arrayOfAllKeys<SnakecasedKeysLeadWithTenant>()([
  'provider_name',
  'customer_id',
  'id',
  'created_at',
  'updated_at',
  'was_deleted',
  'deleted_at',
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
]);
