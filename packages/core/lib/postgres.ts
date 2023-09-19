import type { CommonObjectType, ProviderCategory, ProviderName } from '@supaglue/types';
import type { CRMCommonObjectType } from '@supaglue/types/crm';
import type { EngagementCommonObjectType } from '@supaglue/types/engagement';
import { slugifyForTableName } from '@supaglue/utils';
import fs from 'fs';
import { Pool } from 'pg';
import {
  keysOfSnakecasedCrmAccountWithTenant,
  keysOfSnakecasedCrmContactWithTenant,
  keysOfSnakecasedCrmUserWithTenant,
  keysOfSnakecasedLeadWithTenant,
  keysOfSnakecasedOpportunityWithTenant,
} from '../keys/crm';
import {
  keysOfSnakecasedEngagementAccountWithTenant,
  keysOfSnakecasedEngagementContactWithTenant,
  keysOfSnakecasedEngagementUserWithTenant,
  keysOfSnakecasedMailboxWithTenant,
  keysOfSnakecasedSequenceStateWithTenant,
  keysOfSnakecasedSequenceStepWithTenant,
  keysOfSnakecasedSequenceWithTenant,
} from '../keys/engagement';

export const getPgPool = (connectionString: string): Pool => {
  // parse the connectionString URL to get the ssl config from the query string
  const parsedConnectionString = new URL(connectionString);
  const caCertPath = parsedConnectionString.searchParams.get('sslcert');
  const sslMode = parsedConnectionString.searchParams.get('sslmode');
  const sslAccept = parsedConnectionString.searchParams.get('sslaccept');
  // delete from the query string so that the connectionString can be passed to the pgPool
  parsedConnectionString.searchParams.delete('sslcert');
  parsedConnectionString.searchParams.delete('sslmode');
  parsedConnectionString.searchParams.delete('sslaccept');
  const ssl =
    sslMode === 'require' || sslMode === 'prefer'
      ? {
          ca: caCertPath ? fs.readFileSync(caCertPath).toString() : undefined,
          rejectUnauthorized: sslAccept === 'strict',
        }
      : undefined;

  return new Pool({
    connectionString: parsedConnectionString.toString(),
    max: 5,
    ssl,
  });
};

export function sanitizeForPostgres(tableName: string): string {
  // Replace dashes with underscores
  let sanitized = tableName.replace(/-/g, '_');

  // Remove characters that are not letters, numbers, or underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9_]/g, '');

  // Make sure the table name starts with a letter or an underscore
  if (!sanitized.match(/^[a-zA-Z_]/)) {
    sanitized = '_' + sanitized;
  }

  return sanitized;
}

export const getSchemaName = (applicationId: string) => {
  return sanitizeForPostgres(applicationId);
};

export const getObjectTableName = (providerName: ProviderName, object: string) => {
  const cleanObjectName = slugifyForTableName(object);
  return `${providerName}_${cleanObjectName}`;
};

export const getCommonObjectTableName = (category: ProviderCategory, commonObjectType: CommonObjectType) => {
  if (category === 'crm') {
    return tableNamesByCommonObjectType.crm[commonObjectType as CRMCommonObjectType];
  }
  return tableNamesByCommonObjectType.engagement[commonObjectType as EngagementCommonObjectType];
};

export const tableNamesByCommonObjectType: {
  crm: Record<CRMCommonObjectType, string>;
  engagement: Record<EngagementCommonObjectType, string>;
} = {
  crm: {
    account: 'crm_accounts',
    contact: 'crm_contacts',
    lead: 'crm_leads',
    opportunity: 'crm_opportunities',
    user: 'crm_users',
  },
  engagement: {
    account: 'engagement_accounts',
    contact: 'engagement_contacts',
    sequence_state: 'engagement_sequence_states',
    sequence_step: 'engagement_sequence_steps',
    user: 'engagement_users',
    sequence: 'engagement_sequences',
    mailbox: 'engagement_mailboxes',
  },
};

export const getColumnsForCommonObject = (category: ProviderCategory, commonObjectType: CommonObjectType) => {
  if (category === 'crm') {
    return columnsByCommonObjectType.crm[commonObjectType as CRMCommonObjectType];
  }
  return columnsByCommonObjectType.engagement[commonObjectType as EngagementCommonObjectType];
};

export const columnsByCommonObjectType: {
  crm: Record<CRMCommonObjectType, string[]>;
  engagement: Record<EngagementCommonObjectType, string[]>;
} = {
  crm: {
    account: keysOfSnakecasedCrmAccountWithTenant,
    contact: keysOfSnakecasedCrmContactWithTenant,
    lead: keysOfSnakecasedLeadWithTenant,
    opportunity: keysOfSnakecasedOpportunityWithTenant,
    user: keysOfSnakecasedCrmUserWithTenant,
  },
  engagement: {
    account: keysOfSnakecasedEngagementAccountWithTenant,
    contact: keysOfSnakecasedEngagementContactWithTenant,
    sequence_state: keysOfSnakecasedSequenceStateWithTenant,
    sequence_step: keysOfSnakecasedSequenceStepWithTenant,
    user: keysOfSnakecasedEngagementUserWithTenant,
    sequence: keysOfSnakecasedSequenceWithTenant,
    mailbox: keysOfSnakecasedMailboxWithTenant,
  },
};

export const getCommonObjectSchemaSetupSql = (category: ProviderCategory, commonObjectType: CommonObjectType) => {
  if (category === 'crm') {
    return schemaSetupSqlByCommonObjectType.crm[commonObjectType as CRMCommonObjectType];
  }
  return schemaSetupSqlByCommonObjectType.engagement[commonObjectType as EngagementCommonObjectType];
};

export const schemaSetupSqlByCommonObjectType: {
  crm: Record<CRMCommonObjectType, (schema: string, temp?: boolean, partition?: boolean) => string>;
  engagement: Record<EngagementCommonObjectType, (schema: string, temp?: boolean, partition?: boolean) => string>;
} = {
  crm: {
    account: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? 'temp_crm_accounts' : `"${schema}".crm_accounts`} (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "name" TEXT,
  "description" TEXT,
  "industry" TEXT,
  "website" TEXT,
  "number_of_employees" INTEGER,
  "addresses" JSONB,
  "phone_numbers" JSONB,
  "last_activity_at" TIMESTAMP(3),
  "lifecycle_stage" TEXT,
  "owner_id" TEXT,
  "raw_data" JSONB

  -- Duplicates can exist for accounts (e.g. Hubspot)
  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
    contact: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? 'temp_crm_contacts' : `"${schema}".crm_contacts`} (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "addresses" JSONB NOT NULL,
  "email_addresses" JSONB NOT NULL,
  "phone_numbers" JSONB NOT NULL,
  "lifecycle_stage" TEXT,
  "account_id" TEXT,
  "owner_id" TEXT,
  "last_activity_at" TIMESTAMP(3),
  "raw_data" JSONB

  -- Duplicates can exist for contacts (e.g. Hubspot)
  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
    lead: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? 'temp_crm_leads' : `"${schema}".crm_leads`} (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "lead_source" TEXT,
  "title" TEXT,
  "company" TEXT,
  "first_name" TEXT,
  "last_name" TEXT,
  "addresses" JSONB,
  "email_addresses" JSONB,
  "phone_numbers" JSONB,
  "converted_date" TIMESTAMP(3),
  "converted_contact_id" TEXT,
  "converted_account_id" TEXT,
  "owner_id" TEXT,
  "raw_data" JSONB

  -- Duplicates can exist for leads (e.g. Hubspot)
  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
    opportunity: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_crm_opportunities' : `"${schema}".crm_opportunities`
    } (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "name" TEXT,
  "description" TEXT,
  "amount" FLOAT,
  "stage" TEXT,
  "status" TEXT,
  "close_date" TIMESTAMP(3),
  "pipeline" TEXT,
  "account_id" TEXT,
  "owner_id" TEXT,
  "last_activity_at" TIMESTAMP(3),
  "raw_data" JSONB

  -- Duplicates can exist for opportunities (e.g. Hubspot)
  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
    user: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? 'temp_crm_users' : `"${schema}".crm_users`} (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "is_active" BOOLEAN,
  "raw_data" JSONB

  -- Duplicates can exist for users (e.g. Hubspot)
  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
  },
  engagement: {
    account: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_accounts' : `"${schema}".engagement_accounts`
    } (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "name" TEXT,
  "domain" TEXT,
  "owner_id" TEXT,
  "raw_data" JSONB

  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
    contact: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_contacts' : `"${schema}".engagement_contacts`
    } (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "job_title" TEXT,
  "address" JSONB,
  "email_addresses" JSONB NOT NULL,
  "phone_numbers" JSONB NOT NULL,
  "owner_id" TEXT,
  "account_id" TEXT,
  "open_count" INTEGER NOT NULL,
  "click_count" INTEGER NOT NULL,
  "reply_count" INTEGER NOT NULL,
  "bounced_count" INTEGER NOT NULL,
  "raw_data" JSONB

  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
);`,
    mailbox: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_mailboxes' : `"${schema}".engagement_mailboxes`
    } (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "email" TEXT,
  "user_id" TEXT,
  "raw_data" JSONB

  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
    sequence: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_sequences' : `"${schema}".engagement_sequences`
    } (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "owner_id" TEXT,
  "name" TEXT,
  "tags" JSONB,
  "num_steps" INTEGER NOT NULL,
  "metrics" JSONB,
  "is_enabled" BOOLEAN NOT NULL,
  "raw_data" JSONB

  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
    sequence_state: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_sequence_states' : `"${schema}".engagement_sequence_states`
    } (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "sequence_id" TEXT,
  "contact_id" TEXT,
  "mailbox_id" TEXT,
  "user_id" TEXT,
  "state" TEXT,
  "raw_data" JSONB

  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
);`,
    sequence_step: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_sequence_steps' : `"${schema}".engagement_sequence_steps`
    } (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "sequence_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "raw_data" JSONB

  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
    user: (schema: string, temp = false, partition = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_users' : `"${schema}".engagement_users`
    } (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "is_deleted" BOOLEAN NOT NULL DEFAULT false,
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "email" TEXT,
  "raw_data" JSONB

  ${temp ? '' : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'}
)${partition ? ' PARTITION BY LIST ( _supaglue_customer_id );' : ';'}`,
  },
};

export function getSsl(sslMode: 'disable' | 'allow' | 'prefer' | 'require' | undefined): boolean | undefined {
  return sslMode === undefined || sslMode === 'disable' || sslMode === 'allow' ? undefined : true;
}
