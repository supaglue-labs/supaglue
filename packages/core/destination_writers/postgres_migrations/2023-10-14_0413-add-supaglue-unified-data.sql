
--- Forward migration

DO $$
DECLARE
	ele record;
BEGIN
	FOR ele IN
		SELECT
      t.table_schema,
      t.table_name
    FROM
      information_schema.tables t
    WHERE
      -- Only tables, not views
      t.table_type = 'BASE TABLE'
      -- Filter for the common model tables only
      AND (starts_with (t."table_name", 'crm_')
        OR starts_with (t."table_name", 'engagement_'))
      -- Confirming we are operating on a supaglue managed table just on case
      AND EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE 
          c.table_schema = t.table_schema
          AND c.table_name = t."table_name"
          AND c.column_name = '_supaglue_application_id'
      )
      -- Filter out partitions of tables (e.g. crm_account_salesforce)
      AND NOT EXISTS (
        SELECT 1 FROM pg_inherits 
        WHERE inhrelid = format('%s.%s', t.table_schema, t."table_name")::regclass
      )
      -- Filter out tables which already has migrations ran
      AND NOT EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE 
          c.table_schema = t.table_schema
          AND c.table_name = t."table_name"
          AND c.column_name = '_supaglue_unified_data'
      )
      
	LOOP
	  EXECUTE format('ALTER TABLE %I.%I ADD COLUMN _supaglue_unified_data jsonb', ele.table_schema, ele.table_name);
	  RAISE NOTICE 'Added _supabase_unified_data column for %', ele;      
	END LOOP;
END;
$$;


--- Backwards migration

DO $$
DECLARE
	ele record;
BEGIN
	FOR ele IN
		SELECT
      t.table_schema,
      t.table_name
    FROM
      information_schema.tables t
    WHERE
      -- Only tables, not views
      t.table_type = 'BASE TABLE'
      -- Filter for the common model tables only
      AND(starts_with (t."table_name", 'crm_')
        OR starts_with (t."table_name", 'engagement_'))
      -- Confirming we are operating on a supaglue managed table just on case
      AND EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE 
          c.table_schema = t.table_schema
          AND c.table_name = t."table_name"
          AND c.column_name = '_supaglue_application_id'
      )
      -- Filter out partitions of tables (e.g. crm_account_salesforce)
      AND NOT EXISTS (
        SELECT 1 FROM pg_inherits 
        WHERE inhrelid = format('%s.%s', t.table_schema, t."table_name")::regclass
      )
      -- Filter out tables which already has migrations ran
      AND EXISTS (
        SELECT 1
        FROM information_schema.columns c
        WHERE 
          c.table_schema = t.table_schema
          AND c.table_name = t."table_name"
          AND c.column_name = '_supaglue_unified_data'
      )
      
	LOOP
	  EXECUTE format('ALTER TABLE %I.%I DROP COLUMN _supaglue_unified_data', ele.table_schema, ele.table_name);
	  RAISE NOTICE 'Dropped _supabase_unified_data column for %', ele;      
	END LOOP;
END;
$$;
