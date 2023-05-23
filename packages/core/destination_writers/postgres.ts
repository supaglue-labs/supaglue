import type { CommonModel, ConnectionSafeAny, IntegrationCategory, PostgresDestination } from '@supaglue/types';
import type { CRMCommonModelType } from '@supaglue/types/crm';
import { stringify } from 'csv-stringify';
import { Pool, PoolClient } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import {
  keysOfSnakecasedCrmAccountWithTenant,
  keysOfSnakecasedCrmContactWithTenant,
  keysOfSnakecasedCrmUserWithTenant,
  keysOfSnakecasedLeadWithTenant,
  keysOfSnakecasedOpportunityWithTenant,
} from '../keys/crm';
import { keysOfSnakecasedEngagementContactWithTenant } from '../keys/engagement/contact';
import { keysOfSnakecasedMailboxWithTenant } from '../keys/engagement/mailbox';
import { keysOfSnakecasedSequenceWithTenant } from '../keys/engagement/sequence';
import { keysOfSnakecasedSequenceStateWithTenant } from '../keys/engagement/sequence_state';
import { keysOfSnakecasedEngagementUserWithTenant } from '../keys/engagement/user';
import { logger } from '../lib';
import {
  toSnakecasedKeysCrmAccount,
  toSnakecasedKeysCrmContact,
  toSnakecasedKeysCrmUser,
  toSnakecasedKeysLead,
  toSnakecasedKeysOpportunity,
} from '../mappers/crm';
import {
  toSnakecasedKeysMailbox,
  toSnakecasedKeysSequence,
  toSnakecasedKeysSequenceState,
} from '../mappers/engagement';
import { BaseDestinationWriter, WriteCommonModelsResult } from './base';

const destinationIdToPool: Record<string, Pool> = {};

export class PostgresDestinationWriter extends BaseDestinationWriter {
  readonly #destination: PostgresDestination;

  public constructor(destination: PostgresDestination) {
    super();
    this.#destination = destination;
  }

  async #getClient(): Promise<PoolClient> {
    const existingPool = destinationIdToPool[this.#destination.id];
    if (existingPool) {
      return await existingPool.connect();
    }

    const pool = new Pool(this.#destination.config);
    destinationIdToPool[this.#destination.id] = pool;
    return await pool.connect();
  }

  public override async writeObjects(
    { id: connectionId, providerName, customerId, category }: ConnectionSafeAny,
    commonModelType: CommonModel,
    inputStream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult> {
    const childLogger = logger.child({ connectionId, providerName, customerId, commonModelType });

    const { schema } = this.#destination.config;
    const table = tableNamesByCommonModelType[category][commonModelType];
    const qualifiedTable = `${schema}.${table}`;
    const tempTable = `temp_${table}`;

    const client = await this.#getClient();

    try {
      // Create tables if necessary
      // TODO: We should only need to do this once at the beginning
      await client.query(schemaSetupSqlByCommonModelType[category][commonModelType](schema));

      // Create a temporary table
      // TODO: on the first run, we should be able to directly write into the table and skip the temp table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      await client.query(`CREATE TEMP TABLE IF NOT EXISTS ${tempTable} (LIKE ${qualifiedTable})`);
      await client.query(
        `CREATE INDEX IF NOT EXISTS ${tempTable}_provider_name_customer_id_remote_id_idx ON ${tempTable} (provider_name, customer_id, remote_id)`
      );

      const columns = columnsByCommonModelType[category][commonModelType];
      const columnsWithoutPK = columns.filter((c) => c !== 'provider_name' && c !== 'customer_id' && c !== 'remote_id');

      // Output
      const stream = client.query(
        copyFrom(`COPY ${tempTable} (${columns.join(',')}) FROM STDIN WITH (DELIMITER ',', FORMAT CSV)`)
      );

      // Input
      const stringifier = stringify({
        columns,
        cast: {
          boolean: (value: boolean) => value.toString(),
          object: (value: object) => JSON.stringify(value),
          date: (value: Date) => value.toISOString(),
        },
        quoted: true,
      });

      const mapper = snakecasedKeysMapperByCommonModelType[commonModelType];

      // Keep track of stuff
      let tempTableRowCount = 0;
      let maxLastModifiedAt: Date | null = null;

      childLogger.info('Importing common model objects into temp table [IN PROGRESS]');
      await pipeline(
        inputStream,
        new Transform({
          objectMode: true,
          transform: (chunk, encoding, callback) => {
            try {
              const mappedRecord = {
                provider_name: providerName,
                customer_id: customerId,
                ...mapper(chunk),
              };

              ++tempTableRowCount;

              // Update the max lastModifiedAt
              const { lastModifiedAt } = chunk;
              if (lastModifiedAt && (!maxLastModifiedAt || lastModifiedAt > maxLastModifiedAt)) {
                maxLastModifiedAt = lastModifiedAt;
              }

              callback(null, mappedRecord);
            } catch (e: any) {
              return callback(e);
            }
          },
        }),
        stringifier,
        stream
      );
      childLogger.info('Importing common model objects into temp table [COMPLETED]');

      // Copy from temp table
      childLogger.info({ offset: null }, 'Copying from temp table to main table [IN PROGRESS]');
      const columnsToUpdateStr = columnsWithoutPK.join(',');
      const excludedColumnsToUpdateStr = columnsWithoutPK.map((column) => `EXCLUDED.${column}`).join(',');

      // Paginate
      const batchSize = 10000;
      for (let offset = 0; offset < tempTableRowCount; offset += batchSize) {
        childLogger.info({ offset }, 'Copying from temp table to main table [IN PROGRESS]');
        // IMPORTANT: we need to use DISTINCT ON because we may have multiple records with the same remote_id
        // For example, hubspot will return the same record twice when querying for `archived: true` if
        // the record was archived, restored, and archived again.
        // TODO: This may have performance implications. We should look into this later.
        // https://github.com/supaglue-labs/supaglue/issues/497
        await client.query(`INSERT INTO ${qualifiedTable}
SELECT DISTINCT ON (remote_id) * FROM (SELECT * FROM ${tempTable} ORDER BY remote_id OFFSET ${offset} limit ${batchSize}) AS batch
ON CONFLICT (provider_name, customer_id, remote_id)
DO UPDATE SET (${columnsToUpdateStr}) = (${excludedColumnsToUpdateStr})`);
        childLogger.info({ offset }, 'Copying from temp table to main table [COMPLETED]');
        onUpsertBatchCompletion(offset, tempTableRowCount);
      }

      childLogger.info('Copying from temp table to main table [COMPLETED]');

      return {
        maxLastModifiedAt,
        numRecords: tempTableRowCount, // TODO: not quite accurate (because there can be duplicates) but good enough
      };
    } finally {
      client.release();
    }
  }
}

const tableNamesByCommonModelType: Record<IntegrationCategory, Record<string, string>> = {
  crm: {
    account: 'crm_accounts',
    contact: 'crm_contacts',
    lead: 'crm_leads',
    opportunity: 'crm_opportunities',
    user: 'crm_users',
  },
  engagement: {
    contact: 'engagement_contacts',
    sequence_state: 'engagement_sequence_states',
    user: 'engagement_users',
    sequence: 'engagement_sequences',
    mailboxe: 'engagement_mailboxes',
  },
};

const columnsByCommonModelType = {
  crm: {
    account: keysOfSnakecasedCrmAccountWithTenant,
    contact: keysOfSnakecasedCrmContactWithTenant,
    lead: keysOfSnakecasedLeadWithTenant,
    opportunity: keysOfSnakecasedOpportunityWithTenant,
    user: keysOfSnakecasedCrmUserWithTenant,
  },
  engagement: {
    contacts: keysOfSnakecasedEngagementContactWithTenant,
    sequence_states: keysOfSnakecasedSequenceStateWithTenant,
    users: keysOfSnakecasedEngagementUserWithTenant,
    sequences: keysOfSnakecasedSequenceWithTenant,
    mailboxes: keysOfSnakecasedMailboxWithTenant,
  },
};

const snakecasedKeysMapperByCommonModelType = {
  crm: {
    account: toSnakecasedKeysCrmAccount,
    contact: toSnakecasedKeysCrmContact,
    lead: toSnakecasedKeysLead,
    opportunity: toSnakecasedKeysOpportunity,
    user: toSnakecasedKeysCrmUser,
  },
  engagement: {
    contact: toSnakecasedKeysEngagementContact,
    mailbox: toSnakecasedKeysMailbox,
    sequence: toSnakecasedKeysSequence,
    sequence_state: toSnakecasedKeysSequenceState,
    user: toSnakecasedKeysEngagementUser,
  },
};

const schemaSetupSqlByCommonModelType: Record<CRMCommonModelType, (schema: string) => string> = {
  account: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_accounts" (
  "provider_name" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "remote_id" TEXT NOT NULL,
  "name" TEXT,
  "description" TEXT,
  "industry" TEXT,
  "website" TEXT,
  "number_of_employees" INTEGER,
  "addresses" JSONB,
  "phone_numbers" JSONB,
  "lifecycle_stage" TEXT,
  "last_activity_at" TIMESTAMP(3),
  "remote_data" JSONB,
  "remote_created_at" TIMESTAMP(3),
  "remote_updated_at" TIMESTAMP(3),
  "remote_was_deleted" BOOLEAN NOT NULL,
  "remote_deleted_at" TIMESTAMP(3),
  "detected_or_remote_deleted_at" TIMESTAMP(3),
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "owner_id" TEXT,

  CONSTRAINT "crm_accounts_pkey" PRIMARY KEY ("provider_name", "customer_id", "remote_id")
);`,
  contact: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_contacts" (
  "provider_name" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "remote_id" TEXT NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "addresses" JSONB NOT NULL,
  "email_addresses" JSONB NOT NULL,
  "phone_numbers" JSONB NOT NULL,
  "last_activity_at" TIMESTAMP(3),
  "lifecycle_stage" TEXT,
  "remote_data" JSONB,
  "remote_created_at" TIMESTAMP(3),
  "remote_updated_at" TIMESTAMP(3),
  "remote_was_deleted" BOOLEAN NOT NULL,
  "remote_deleted_at" TIMESTAMP(3),
  "detected_or_remote_deleted_at" TIMESTAMP(3),
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "account_id" TEXT,
  "owner_id" TEXT,

  CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("provider_name", "customer_id", "remote_id")
);`,
  lead: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_leads" (
  "provider_name" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "remote_id" TEXT NOT NULL,
  "lead_source" TEXT,
  "title" TEXT,
  "company" TEXT,
  "first_name" TEXT,
  "last_name" TEXT,
  "addresses" JSONB,
  "phone_numbers" JSONB,
  "email_addresses" JSONB,
  "remote_data" JSONB,
  "remote_created_at" TIMESTAMP(3),
  "remote_updated_at" TIMESTAMP(3),
  "remote_was_deleted" BOOLEAN NOT NULL,
  "remote_deleted_at" TIMESTAMP(3),
  "detected_or_remote_deleted_at" TIMESTAMP(3),
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "converted_date" TIMESTAMP(3),
  "converted_account_id" TEXT,
  "converted_contact_id" TEXT,
  "owner_id" TEXT,

  CONSTRAINT "crm_leads_pkey" PRIMARY KEY ("provider_name", "customer_id", "remote_id")
);`,
  opportunity: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_opportunities" (
  "provider_name" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "remote_id" TEXT NOT NULL,
  "name" TEXT,
  "description" TEXT,
  "amount" INTEGER,
  "stage" TEXT,
  "status" TEXT,
  "last_activity_at" TIMESTAMP(3),
  "pipeline" TEXT,
  "close_date" TIMESTAMP(3),
  "remote_created_at" TIMESTAMP(3),
  "remote_updated_at" TIMESTAMP(3),
  "remote_was_deleted" BOOLEAN NOT NULL,
  "remote_deleted_at" TIMESTAMP(3),
  "detected_or_remote_deleted_at" TIMESTAMP(3),
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "account_id" TEXT,
  "owner_id" TEXT,

  CONSTRAINT "crm_opportunities_pkey" PRIMARY KEY ("provider_name", "customer_id", "remote_id")
);`,
  user: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_users" (
    "provider_name" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "remote_id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN,
    "remote_created_at" TIMESTAMP(3),
    "remote_updated_at" TIMESTAMP(3),
    "remote_was_deleted" BOOLEAN NOT NULL,
    "remote_deleted_at" TIMESTAMP(3),
    "detected_or_remote_deleted_at" TIMESTAMP(3),
    "last_modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_users_pkey" PRIMARY KEY ("provider_name", "customer_id", "remote_id")
);`,
};
