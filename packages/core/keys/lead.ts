import { SnakecasedKeysLeadWithTenant } from '@supaglue/types';
import { arrayOfAllKeys } from './util';

export const keysOfSnakecasedLeadWithTenant = arrayOfAllKeys<SnakecasedKeysLeadWithTenant>()([
  'provider_name',
  'customer_id',
  'remote_id',
  'remote_created_at',
  'remote_updated_at',
  'remote_was_deleted',
  'remote_deleted_at',
  'detected_or_remote_deleted_at',
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
