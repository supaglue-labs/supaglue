---- Run these manually if needed

-- ALTER TABLE crm_accounts ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE crm_contacts ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE crm_leads ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE crm_opportunities ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE crm_users ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE engagement_accounts ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE engagement_contacts ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE engagement_sequence_states ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE engagement_sequence_steps ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE engagement_users ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE engagement_sequences ADD COLUMN _supaglue_unified_data jsonb;
-- ALTER TABLE engagement_mailboxes ADD COLUMN _supaglue_unified_data jsonb;

--- At your conveinece you can extract the columns you need from supaglue unified data model into top level postgres columns
ALTER TABLE engagement_users ADD COLUMN is_locked boolean 
  GENERATED ALWAYS AS ((_supaglue_unified_data->> 'is_locked')::boolean) STORED;

ALTER TABLE engagement_mailboxes ADD COLUMN is_disabled boolean 
  GENERATED ALWAYS AS ((_supaglue_unified_data->> 'is_disabled')::boolean) STORED;

ALTER TABLE engagement_sequences ADD COLUMN is_archived boolean 
  GENERATED ALWAYS AS ((_supaglue_unified_data->> 'is_archived')::boolean) STORED;

-- aka share_type
ALTER TABLE engagement_sequences ADD COLUMN type varchar 
  GENERATED ALWAYS AS (_supaglue_unified_data->> 'type') STORED;
