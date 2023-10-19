export const keysOfSnakecasedCrmAccountWithTenant = [
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
  'name',
  'description',
  'industry',
  'website',
  'number_of_employees',
  'addresses',
  'phone_numbers',
  'last_activity_at',
  'lifecycle_stage',
  'owner_id',
  'raw_data',
];
