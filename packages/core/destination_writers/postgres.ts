import { ConnectionSafeAny, PostgresDestination } from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { stringify } from 'csv-stringify';
import { Pool, PoolClient } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { keysOfSnakecasedAccountWithTenant } from '../keys/account';
import { keysOfSnakecasedContactWithTenant } from '../keys/contact';
import { keysOfSnakecasedEventWithTenant } from '../keys/event';
import { keysOfSnakecasedLeadWithTenant } from '../keys/lead';
import { keysOfSnakecasedOpportunityWithTenant } from '../keys/opportunity';
import { keysOfSnakecasedUserWithTenant } from '../keys/user';
import { logger } from '../lib';
import { toSnakecasedKeysAccount } from '../mappers/crm/account';
import { toSnakecasedKeysContact } from '../mappers/crm/contact';
import { toSnakecasedKeysEvent } from '../mappers/crm/event';
import { toSnakecasedKeysLead } from '../mappers/crm/lead';
import { toSnakecasedKeysOpportunity } from '../mappers/crm/opportunity';
import { toSnakecasedKeysUser } from '../mappers/crm/user';
import { BaseDestinationWriter, WriteCommonModelsResult } from './base';

export const DESTINATION_ID_TO_POOL: Record<string, Pool> = {};

export class PostgresDestinationWriter extends BaseDestinationWriter {
  readonly #destination: PostgresDestination;

  public constructor(destination: PostgresDestination) {
    super();
    this.#destination = destination;
  }

  async #getClient(): Promise<PoolClient> {
    const existingPool = DESTINATION_ID_TO_POOL[this.#destination.id];
    if (existingPool) {
      return await existingPool.connect();
    }

    const pool = new Pool(this.#destination.config);
    return await pool.connect();
  }

  public override async writeObjects(
    { id: connectionId, providerName, customerId }: ConnectionSafeAny,
    commonModelType: CRMCommonModelType,
    inputStream: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<WriteCommonModelsResult> {
    const childLogger = logger.child({ connectionId, providerName, customerId, commonModelType });

    const { schema } = this.#destination.config;
    const table = tableNamesByCommonModelType[commonModelType];
    const qualifiedTable = `${schema}.${table}`;
    const tempTable = `temp_${table}`;

    const client = await this.#getClient();

    try {
      // Create tables if necessary
      // TODO: We should only need to do this once at the beginning
      await client.query(schemaSetupSqlByCommonModelType[commonModelType](schema));

      // Create a temporary table
      // TODO: on the first run, we should be able to directly write into the table and skip the temp table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      await client.query(`CREATE TEMP TABLE IF NOT EXISTS ${tempTable} (LIKE ${qualifiedTable})`);
      await client.query(
        `CREATE INDEX IF NOT EXISTS ${tempTable}_provider_name_customer_id_id_idx ON ${tempTable} (provider_name, customer_id, id)`
      );

      const columns = columnsByCommonModelType[commonModelType];
      const columnsWithoutPK = columns.filter((c) => c !== 'provider_name' && c !== 'customer_id' && c !== 'id');

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
        // IMPORTANT: we need to use DISTINCT ON because we may have multiple records with the same id
        // For example, hubspot will return the same record twice when querying for `archived: true` if
        // the record was archived, restored, and archived again.
        // TODO: This may have performance implications. We should look into this later.
        // https://github.com/supaglue-labs/supaglue/issues/497
        await client.query(`INSERT INTO ${qualifiedTable}
SELECT DISTINCT ON (id) * FROM (SELECT * FROM ${tempTable} ORDER BY id OFFSET ${offset} limit ${batchSize}) AS batch
ON CONFLICT (provider_name, customer_id, id)
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

const tableNamesByCommonModelType: Record<CRMCommonModelType, string> = {
  account: 'crm_accounts',
  contact: 'crm_contacts',
  lead: 'crm_leads',
  opportunity: 'crm_opportunities',
  user: 'crm_users',
  event: 'crm_events',
};

const columnsByCommonModelType: Record<CRMCommonModelType, string[]> = {
  account: keysOfSnakecasedAccountWithTenant,
  contact: keysOfSnakecasedContactWithTenant,
  lead: keysOfSnakecasedLeadWithTenant,
  opportunity: keysOfSnakecasedOpportunityWithTenant,
  user: keysOfSnakecasedUserWithTenant,
  event: keysOfSnakecasedEventWithTenant,
};

const snakecasedKeysMapperByCommonModelType: Record<CRMCommonModelType, (obj: any) => any> = {
  account: toSnakecasedKeysAccount,
  contact: toSnakecasedKeysContact,
  lead: toSnakecasedKeysLead,
  opportunity: toSnakecasedKeysOpportunity,
  user: toSnakecasedKeysUser,
  event: toSnakecasedKeysEvent,
};

const schemaSetupSqlByCommonModelType: Record<CRMCommonModelType, (schema: string) => string> = {
  account: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_accounts" (
  "provider_name" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "id" TEXT NOT NULL,
  "name" TEXT,
  "description" TEXT,
  "industry" TEXT,
  "website" TEXT,
  "number_of_employees" INTEGER,
  "addresses" JSONB,
  "phone_numbers" JSONB,
  "lifecycle_stage" TEXT,
  "last_activity_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "was_deleted" BOOLEAN NOT NULL,
  "deleted_at" TIMESTAMP(3),
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "owner_id" TEXT,

  CONSTRAINT "crm_accounts_pkey" PRIMARY KEY ("provider_name", "customer_id", "id")
);`,
  contact: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_contacts" (
  "provider_name" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "id" TEXT NOT NULL,
  "first_name" TEXT,
  "last_name" TEXT,
  "addresses" JSONB NOT NULL,
  "email_addresses" JSONB NOT NULL,
  "phone_numbers" JSONB NOT NULL,
  "last_activity_at" TIMESTAMP(3),
  "lifecycle_stage" TEXT,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "was_deleted" BOOLEAN NOT NULL,
  "deleted_at" TIMESTAMP(3),
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "account_id" TEXT,
  "owner_id" TEXT,

  CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("provider_name", "customer_id", "id")
);`,
  lead: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_leads" (
  "provider_name" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "id" TEXT NOT NULL,
  "lead_source" TEXT,
  "title" TEXT,
  "company" TEXT,
  "first_name" TEXT,
  "last_name" TEXT,
  "addresses" JSONB,
  "phone_numbers" JSONB,
  "email_addresses" JSONB,
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "was_deleted" BOOLEAN NOT NULL,
  "deleted_at" TIMESTAMP(3),
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "converted_date" TIMESTAMP(3),
  "converted_account_id" TEXT,
  "converted_contact_id" TEXT,
  "owner_id" TEXT,

  CONSTRAINT "crm_leads_pkey" PRIMARY KEY ("provider_name", "customer_id", "id")
);`,
  opportunity: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_opportunities" (
  "provider_name" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "id" TEXT NOT NULL,
  "name" TEXT,
  "description" TEXT,
  "amount" INTEGER,
  "stage" TEXT,
  "status" TEXT,
  "last_activity_at" TIMESTAMP(3),
  "pipeline" TEXT,
  "close_date" TIMESTAMP(3),
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "was_deleted" BOOLEAN NOT NULL,
  "deleted_at" TIMESTAMP(3),
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "account_id" TEXT,
  "owner_id" TEXT,

  CONSTRAINT "crm_opportunities_pkey" PRIMARY KEY ("provider_name", "customer_id", "id")
);`,
  user: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_users" (
    "provider_name" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "is_active" BOOLEAN,
    "created_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3),
    "was_deleted" BOOLEAN NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "last_modified_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_users_pkey" PRIMARY KEY ("provider_name", "customer_id", "id")
);`,
  event: (schema: string) => `-- CreateTable
CREATE TABLE IF NOT EXISTS "${schema}"."crm_events" (
  "provider_name" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL,
  "id" TEXT NOT NULL,
  "type" TEXT,
  "subject" TEXT,
  "content" TEXT,
  "start_time" TIMESTAMP(3),
  "end_time" TIMESTAMP(3),
  "created_at" TIMESTAMP(3),
  "updated_at" TIMESTAMP(3),
  "was_deleted" BOOLEAN NOT NULL,
  "deleted_at" TIMESTAMP(3),
  "last_modified_at" TIMESTAMP(3) NOT NULL,
  "account_id" TEXT,
  "contact_id" TEXT,
  "lead_id" TEXT,
  "opportunity_id" TEXT,
  "owner_id" TEXT,

  CONSTRAINT "crm_events_pkey" PRIMARY KEY ("provider_name", "customer_id", "id")
);`,
};
