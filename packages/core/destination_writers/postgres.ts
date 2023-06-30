import type {
  CommonModelType,
  CommonModelTypeForCategory,
  CommonModelTypeMapForCategory,
  ConnectionSafeAny,
  NormalizedRawRecord,
  PostgresDestination,
  ProviderCategory,
  ProviderName,
} from '@supaglue/types';
import { CRMCommonModelType } from '@supaglue/types/crm';
import { EngagementCommonModelType } from '@supaglue/types/engagement';
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
import { BaseDestinationWriter, WriteCommonModelRecordsResult, WriteObjectRecordsResult } from './base';
import { getSnakecasedKeysMapper } from './util';

export class PostgresDestinationWriter extends BaseDestinationWriter {
  readonly #destination: PostgresDestination;

  public constructor(destination: PostgresDestination) {
    super();
    this.#destination = destination;
  }

  async #getClient(): Promise<PoolClient> {
    const pool = new Pool(this.#destination.config);
    return await pool.connect();
  }

  public override async upsertCommonModelRecord<P extends ProviderCategory, T extends CommonModelTypeForCategory<P>>(
    { providerName, customerId, category, applicationId }: ConnectionSafeAny,
    commonModelType: T,
    object: CommonModelTypeMapForCategory<P>['object']
  ): Promise<void> {
    const { schema } = this.#destination.config;
    const table = getCommonModelTableName(category, commonModelType);
    const qualifiedTable = `${schema}.${table}`;

    const client = await this.#getClient();

    try {
      // Create tables if necessary
      // TODO: We should only need to do this once at the beginning
      await client.query(getCommonModelSchemaSetupSql(category, commonModelType)(schema));

      const columns = getColumnsForCommonModel(category, commonModelType);
      const columnsToUpdate = columns.filter(
        (c) =>
          c !== '_supaglue_application_id' &&
          c !== '_supaglue_provider_name' &&
          c !== '_supaglue_customer_id' &&
          c !== 'id'
      );

      const mapper = getSnakecasedKeysMapper(category, commonModelType);

      const mappedRecord = {
        _supaglue_application_id: applicationId,
        _supaglue_provider_name: providerName,
        _supaglue_customer_id: customerId,
        _supaglue_emitted_at: new Date(),
        ...mapper(object),
      };

      const columnsStr = columns.join(',');
      const columnPlaceholderValuesStr = columns.map((column, index) => `$${index + 1}`).join(',');
      const columnsToUpdateStr = columnsToUpdate.join(',');
      const excludedColumnsToUpdateStr = columnsToUpdate.map((column) => `EXCLUDED.${column}`).join(',');
      const values = columns.map((column) => {
        const value = mappedRecord[column];
        // pg doesn't seem to convert objects to JSON even though the docs say it does
        // https://node-postgres.com/features/queries
        if (value !== null && value !== undefined && typeof value === 'object') {
          return JSON.stringify(value);
        }
        return value;
      });

      await client.query(
        `INSERT INTO ${qualifiedTable} (${columnsStr})
VALUES
  (${columnPlaceholderValuesStr})
ON CONFLICT (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
DO UPDATE SET (${columnsToUpdateStr}) = (${excludedColumnsToUpdateStr})`,
        values
      );
    } finally {
      client.release();
    }
  }

  public override async writeCommonModelRecords(
    { id: connectionId, providerName, customerId, category, applicationId }: ConnectionSafeAny,
    commonModelType: CommonModelType,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelRecordsResult> {
    const childLogger = logger.child({ connectionId, providerName, customerId, commonModelType });

    const { schema } = this.#destination.config;
    const table = getCommonModelTableName(category, commonModelType);
    const qualifiedTable = `${schema}.${table}`;
    const tempTable = `temp_${table}`;
    const dedupedTempTable = `deduped_temp_${table}`;

    const client = await this.#getClient();

    try {
      // Create tables if necessary
      // TODO: We should only need to do this once at the beginning
      await client.query(getCommonModelSchemaSetupSql(category, commonModelType)(schema));

      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      await client.query(getCommonModelSchemaSetupSql(category, commonModelType)(schema, /* temp */ true));
      await client.query(`CREATE INDEX IF NOT EXISTS pk_idx ON ${tempTable} (id ASC, last_modified_at DESC)`);

      const columns = getColumnsForCommonModel(category, commonModelType);
      const columnsToUpdate = columns.filter(
        (c) =>
          c !== '_supaglue_application_id' &&
          c !== '_supaglue_provider_name' &&
          c !== '_supaglue_customer_id' &&
          c !== 'id'
      );

      // Output
      const stream = client.query(
        copyFrom(`COPY ${tempTable} (${columns.join(',')}) FROM STDIN WITH (DELIMITER ',', FORMAT CSV)`)
      );

      // Input
      const stringifier = stringify({
        columns,
        cast: {
          boolean: (value: boolean) => value.toString(),
          object: (value: object) => JSON.stringify(value).replace(/\\u0000/g, ''),
          date: (value: Date) => value.toISOString(),
          string: (value: string) => value.replace(/\\u0000/g, ''),
        },
        quoted: true,
      });

      const mapper = getSnakecasedKeysMapper(category, commonModelType);

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
              const { record, emittedAt } = chunk;
              const mappedRecord = {
                _supaglue_application_id: applicationId,
                _supaglue_provider_name: providerName,
                _supaglue_customer_id: customerId,
                _supaglue_emitted_at: emittedAt,
                ...mapper(record),
              };

              ++tempTableRowCount;

              // Update the max lastModifiedAt
              const { lastModifiedAt } = record;
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

      // Dedupe the temp table
      // Since all common models have `lastModifiedAt`, we can sort by that to avoid dupes.
      // We need to do the sorting before applying OFFSET / LIMIT because otherwise, if a record
      // appears as the last record of a page and also the first record of the next page, we will
      // overwrite the newer record with the older record in the main table.
      childLogger.info('Writing deduped temp table records into deduped temp table [IN PROGRESS]');
      await client.query(
        `CREATE TEMP TABLE IF NOT EXISTS ${dedupedTempTable} AS SELECT * FROM ${tempTable} ORDER BY id ASC, last_modified_at DESC`
      );
      childLogger.info('Writing deduped temp table records into deduped temp table [COMPLETED]');

      heartbeat();

      // Drop temp table just in case session disconnects so that we don't have to wait for the VACUUM reaper.
      childLogger.info('Dropping temp table [IN PROGRESS]');
      await client.query(`DROP TABLE IF EXISTS ${tempTable}`);
      childLogger.info('Dropping temp table [COMPLETED]');

      heartbeat();

      // Copy from deduped temp table
      const columnsToUpdateStr = columnsToUpdate.join(',');
      const excludedColumnsToUpdateStr = columnsToUpdate.map((column) => `EXCLUDED.${column}`).join(',');

      // Paginate
      const batchSize = 10000;
      for (let offset = 0; offset < tempTableRowCount; offset += batchSize) {
        childLogger.info({ offset }, 'Copying from deduped temp table to main table [IN PROGRESS]');
        // IMPORTANT: we need to use DISTINCT ON because we may have multiple records with the same id
        // For example, hubspot will return the same record twice when querying for `archived: true` if
        // the record was archived, restored, and archived again.
        // TODO: This may have performance implications. We should look into this later.
        // https://github.com/supaglue-labs/supaglue/issues/497
        await client.query(`INSERT INTO ${qualifiedTable} (${columns.join(',')})
SELECT DISTINCT ON (id) ${columns.join(',')} FROM ${dedupedTempTable} OFFSET ${offset} LIMIT ${batchSize}
ON CONFLICT (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
DO UPDATE SET (${columnsToUpdateStr}) = (${excludedColumnsToUpdateStr})`);
        childLogger.info({ offset }, 'Copying from deduped temp table to main table [COMPLETED]');
        heartbeat();
      }

      childLogger.info('Copying from deduped temp table to main table [COMPLETED]');

      // We don't drop deduped temp table here because we're closing the connection here anyway.

      return {
        maxLastModifiedAt,
        numRecords: tempTableRowCount, // TODO: not quite accurate (because there can be duplicates) but good enough
      };
    } finally {
      client.release();
    }
  }

  public override async writeObjectRecords(
    { id: connectionId, providerName, customerId, applicationId }: ConnectionSafeAny,
    object: string,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteObjectRecordsResult> {
    const childLogger = logger.child({ connectionId, providerName, customerId, object });

    const { schema } = this.#destination.config;
    const table = getObjectTableName(providerName, object);
    const qualifiedTable = `${schema}.${table}`;
    const tempTable = `temp_${table}`;
    const dedupedTempTable = `deduped_temp_${table}`;

    const client = await this.#getClient();

    try {
      // Create tables if necessary
      // TODO: We should only need to do this once at the beginning
      await client.query(getObjectSchemaSetupSql(providerName, object, schema));

      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      await client.query(getObjectSchemaSetupSql(providerName, object, schema, /* temp */ true));
      await client.query(`CREATE INDEX IF NOT EXISTS pk_idx ON ${tempTable} (id ASC, _supaglue_last_modified_at DESC)`);

      // TODO: Make this type-safe
      const columns = [
        '_supaglue_application_id',
        '_supaglue_provider_name',
        '_supaglue_customer_id',
        '_supaglue_emitted_at',
        '_supaglue_is_deleted',
        '_supaglue_raw_data',
        'id',
      ];
      const columnsToUpdate = columns.filter(
        (c) =>
          c !== '_supaglue_application_id' &&
          c !== '_supaglue_provider_name' &&
          c !== '_supaglue_customer_id' &&
          c !== 'id'
      );
      const columnsWithLastModifiedAt = [...columns, '_supaglue_last_modified_at'];

      // Output
      const stream = client.query(
        copyFrom(
          `COPY ${tempTable} (${columnsWithLastModifiedAt.join(',')}) FROM STDIN WITH (DELIMITER ',', FORMAT CSV)`
        )
      );

      // Input
      const stringifier = stringify({
        columns: columnsWithLastModifiedAt,
        cast: {
          boolean: (value: boolean) => value.toString(),
          object: (value: object) => JSON.stringify(value).replace(/\\u0000/g, ''),
          date: (value: Date) => value.toISOString(),
          string: (value: string) => value.replace(/\\u0000/g, ''),
        },
        quoted: true,
      });

      // Keep track of stuff
      let tempTableRowCount = 0;
      let maxLastModifiedAt: Date | null = null;

      childLogger.info('Importing raw records into temp table [IN PROGRESS]');
      await pipeline(
        inputStream,
        new Transform({
          objectMode: true,
          transform: (record: NormalizedRawRecord, encoding, callback) => {
            try {
              const mappedRecord = {
                _supaglue_application_id: applicationId,
                _supaglue_provider_name: providerName,
                _supaglue_customer_id: customerId,
                _supaglue_emitted_at: record.emittedAt,
                _supaglue_is_deleted: record.isDeleted,
                _supaglue_raw_data: record.rawData,
                id: record.id,
                // We're only writing this to the temp table so that we can deduplicate.
                _supaglue_last_modified_at: record.lastModifiedAt,
              };

              ++tempTableRowCount;

              // Update the max lastModifiedAt
              const { lastModifiedAt } = record;
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
      childLogger.info('Importing raw records into temp table [COMPLETED]');

      // Dedupe the temp table
      // Since all records have `lastModifiedAt`, we can sort by that to avoid dupes.
      // We need to do the sorting before applying OFFSET / LIMIT because otherwise, if a record
      // appears as the last record of a page and also the first record of the next page, we will
      // overwrite the newer record with the older record in the main table.
      childLogger.info('Writing deduped temp table records into deduped temp table [IN PROGRESS]');
      await client.query(
        `CREATE TEMP TABLE IF NOT EXISTS ${dedupedTempTable} AS SELECT * FROM ${tempTable} ORDER BY id ASC, _supaglue_last_modified_at DESC`
      );
      childLogger.info('Writing deduped temp table records into deduped temp table [COMPLETED]');

      heartbeat();

      // Drop temp table just in case session disconnects so that we don't have to wait for the VACUUM repear.
      childLogger.info('Dropping temp table [IN PROGRESS]');
      await client.query(`DROP TABLE IF EXISTS ${tempTable}`);
      childLogger.info('Dropping temp table [COMPLETED]');

      heartbeat();

      // Copy from deduped temp table
      const columnsToUpdateStr = columnsToUpdate.join(',');
      const excludedColumnsToUpdateStr = columnsToUpdate.map((column) => `EXCLUDED.${column}`).join(',');

      // Paginate
      const batchSize = 10000;
      for (let offset = 0; offset < tempTableRowCount; offset += batchSize) {
        childLogger.info({ offset }, 'Copying from deduped temp table to main table [IN PROGRESS]');
        // IMPORTANT: we need to use DISTINCT ON because we may have multiple records with the same id
        // For example, hubspot will return the same record twice when querying for `archived: true` if
        // the record was archived, restored, and archived again.
        // TODO: This may have performance implications. We should look into this later.
        // https://github.com/supaglue-labs/supaglue/issues/497
        await client.query(`INSERT INTO ${qualifiedTable} (${columns.join(',')})
SELECT DISTINCT ON (id) ${columns.join(',')} FROM ${dedupedTempTable} OFFSET ${offset} limit ${batchSize}
ON CONFLICT (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, id)
DO UPDATE SET (${columnsToUpdateStr}) = (${excludedColumnsToUpdateStr})`);
        childLogger.info({ offset }, 'Copying from deduped temp table to main table [COMPLETED]');
        heartbeat();
      }

      childLogger.info('Copying from deduped temp table to main table [COMPLETED]');

      // We don't drop deduped temp table here because we're closing the connection here anyway.

      return {
        maxLastModifiedAt,
        numRecords: tempTableRowCount, // TODO: not quite accurate (because there can be duplicates) but good enough
      };
    } finally {
      client.release();
    }
  }
}

const getObjectTableName = (providerName: ProviderName, object: string, temp?: boolean) => {
  return `${temp ? 'temp_' : ''}${providerName}_${object}`;
};

const getCommonModelTableName = (category: ProviderCategory, commonModelType: CommonModelType) => {
  if (category === 'crm') {
    return tableNamesByCommonModelType.crm[commonModelType as CRMCommonModelType];
  }
  return tableNamesByCommonModelType.engagement[commonModelType as EngagementCommonModelType];
};

const tableNamesByCommonModelType: {
  crm: Record<CRMCommonModelType, string>;
  engagement: Record<EngagementCommonModelType, string>;
} = {
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
    mailbox: 'engagement_mailboxes',
  },
};

const getColumnsForCommonModel = (category: ProviderCategory, commonModelType: CommonModelType) => {
  if (category === 'crm') {
    return columnsByCommonModelType.crm[commonModelType as CRMCommonModelType];
  }
  return columnsByCommonModelType.engagement[commonModelType as EngagementCommonModelType];
};

const columnsByCommonModelType: {
  crm: Record<CRMCommonModelType, string[]>;
  engagement: Record<EngagementCommonModelType, string[]>;
} = {
  crm: {
    account: keysOfSnakecasedCrmAccountWithTenant,
    contact: keysOfSnakecasedCrmContactWithTenant,
    lead: keysOfSnakecasedLeadWithTenant,
    opportunity: keysOfSnakecasedOpportunityWithTenant,
    user: keysOfSnakecasedCrmUserWithTenant,
  },
  engagement: {
    contact: keysOfSnakecasedEngagementContactWithTenant,
    sequence_state: keysOfSnakecasedSequenceStateWithTenant,
    user: keysOfSnakecasedEngagementUserWithTenant,
    sequence: keysOfSnakecasedSequenceWithTenant,
    mailbox: keysOfSnakecasedMailboxWithTenant,
  },
};

const getObjectSchemaSetupSql = (providerName: ProviderName, object: string, schema: string, temp?: boolean) => {
  const tableName = getObjectTableName(providerName, object, temp);

  return `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? tableName : `${schema}.${tableName}`} (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "_supaglue_is_deleted" BOOLEAN NOT NULL,
  "_supaglue_raw_data" JSONB NOT NULL,
  "id" TEXT NOT NULL,

  ${
    temp
      ? '"_supaglue_last_modified_at" TIMESTAMP(3) NOT NULL'
      : 'PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")'
  }
);`;
};

const getCommonModelSchemaSetupSql = (category: ProviderCategory, commonModelType: CommonModelType) => {
  if (category === 'crm') {
    return schemaSetupSqlByCommonModelType.crm[commonModelType as CRMCommonModelType];
  }
  return schemaSetupSqlByCommonModelType.engagement[commonModelType as EngagementCommonModelType];
};

const schemaSetupSqlByCommonModelType: {
  crm: Record<CRMCommonModelType, (schema: string, temp?: boolean) => string>;
  engagement: Record<EngagementCommonModelType, (schema: string, temp?: boolean) => string>;
} = {
  crm: {
    account: (schema: string, temp = false) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? 'temp_crm_accounts' : `${schema}."crm_accounts"`} (
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
);`,
    contact: (schema: string, temp?: boolean) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? 'temp_crm_contacts' : `${schema}.crm_contacts`} (
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
);`,
    lead: (schema: string, temp?: boolean) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? 'temp_crm_leads' : `${schema}.crm_leads`} (
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
);`,
    opportunity: (schema: string, temp?: boolean) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_crm_opportunities' : `${schema}.crm_opportunities`
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
  "amount" INTEGER,
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
);`,
    user: (schema: string, temp?: boolean) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? 'temp_crm_users' : `${schema}.crm_users`} (
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
);`,
  },
  engagement: {
    contact: (schema: string, temp?: boolean) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_contacts' : `${schema}.engagement_contacts`
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
  "open_count" INTEGER NOT NULL,
  "click_count" INTEGER NOT NULL,
  "reply_count" INTEGER NOT NULL,
  "bounced_count" INTEGER NOT NULL,
  "raw_data" JSONB,

  PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")
);`,
    mailbox: (schema: string, temp?: boolean) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_mailboxes' : `${schema}.engagement_mailboxes`
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
  "raw_data" JSONB,

  PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")
);`,
    sequence: (schema: string, temp?: boolean) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_sequences' : `${schema}.engagement_sequences`
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
  "schedule_count" INTEGER NOT NULL,
  "click_count" INTEGER NOT NULL,
  "reply_count" INTEGER NOT NULL,
  "open_count" INTEGER NOT NULL,
  "opt_out_count" INTEGER NOT NULL,
  "is_enabled" BOOLEAN NOT NULL,
  "raw_data" JSONB,

  PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")
);`,
    sequence_state: (schema: string, temp?: boolean) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${
      temp ? 'temp_engagement_sequence_states' : `${schema}.engagement_sequence_states`
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
  "state" TEXT,
  "raw_data" JSONB,

  PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")
);`,
    user: (schema: string, temp?: boolean) => `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? 'temp_engagement_users' : `${schema}.engagement_users`} (
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
  "raw_data" JSONB,

  PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "id")
);`,
  },
};
