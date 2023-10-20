export const keysOfSnakecasedSequenceWithTenant = [
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
  'owner_id',
  'name',
  'tags',
  'num_steps',
  'metrics',
  'is_enabled',
  'raw_data',
];
