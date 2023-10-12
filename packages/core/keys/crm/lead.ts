export const keysOfSnakecasedLeadWithTenant = [
  '_supaglue_application_id',
  '_supaglue_provider_name',
  '_supaglue_customer_id',
  '_supaglue_emitted_at',
  '_supaglue_unified_data',
  // _supaglue_raw_data // to be added
  // _supaglue_id // to be added
  // @deprecated fields below. All future fields shall only go into `_supaglue_unified_data` jsonb field
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
];
