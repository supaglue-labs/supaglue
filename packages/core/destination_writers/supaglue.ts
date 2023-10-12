import type {
  CommonObjectType,
  CommonObjectTypeForCategory,
  CommonObjectTypeMapForCategory,
  ConnectionSafeAny,
  FullEntityRecord,
  MappedListedObjectRecord,
  ProviderCategory,
  StandardFullObjectRecord,
} from '@supaglue/types';
import { stringify } from 'csv-stringify';
import type { Pool, PoolClient } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import type { pino } from 'pino';
import type { Readable } from 'stream';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { NotImplementedError } from '../errors';
import {
  getColumnsForCommonObject,
  getCommonObjectSchemaSetupSql,
  getCommonObjectTableName,
  getObjectTableName,
  getPgPool,
  getSchemaName,
  logger,
  sanitizeForPostgres,
} from '../lib';
import type { WriteCommonObjectRecordsResult, WriteEntityRecordsResult, WriteObjectRecordsResult } from './base';
import { BaseDestinationWriter } from './base';
import { getSnakecasedKeysMapper, shouldDeleteRecords } from './util';

async function createPartitionIfNotExists(
  client: PoolClient,
  schema: string,
  table: string,
  customerId: string,
  columnName: string
) {
  const partitionName = `${table}_${sanitizeForPostgres(customerId)}`;

  // If partition doesn't exist, create it
  const createPartitionQuery = `CREATE TABLE IF NOT EXISTS ${schema}.${partitionName} PARTITION OF ${schema}.${table} FOR VALUES IN ('${customerId}')`;
  const createIndexQuery = `CREATE INDEX IF NOT EXISTS ${partitionName}_id_index ON ${schema}.${partitionName} (${columnName});`;
  await client.query(createPartitionQuery);
  await client.query(createIndexQuery);
}

export class SupaglueDestinationWriter extends BaseDestinationWriter {
  #pgPool: Pool;
  constructor() {
    super();
    this.#pgPool = getPgPool(process.env.SUPAGLUE_MANAGED_DATABASE_URL!);
  }
  async #getClient(): Promise<PoolClient> {
    return await this.#pgPool.connect();
  }

  public override async upsertCommonObjectRecord<P extends ProviderCategory, T extends CommonObjectTypeForCategory<P>>(
    { providerName, customerId, category, applicationId }: ConnectionSafeAny,
    commonObjectType: T,
    record: CommonObjectTypeMapForCategory<P>['object']
  ): Promise<void> {
    return;
  }

  public override async writeCommonObjectRecords(
    { id: connectionId, providerName, customerId, category, applicationId }: ConnectionSafeAny,
    commonObjectType: CommonObjectType,
    inputStream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteCommonObjectRecordsResult> {
    const childLogger = logger.child({ connectionId, providerName, customerId, commonObjectType });
    const schema = getSchemaName(applicationId);
    const table = getCommonObjectTableName(category, commonObjectType);
    const qualifiedTable = `"${schema}".${table}`;
    const tempTable = `temp_${table}`;
    const dedupedTempTable = `deduped_temp_${table}`;

    const client = await this.#getClient();

    try {
      // Create tables if necessary
      // TODO: We should only need to do this once at the beginning
      await client.query(getSchemaSetupSql(schema));
      await client.query(
        getCommonObjectSchemaSetupSql(category, commonObjectType)(schema, /* temp */ false, /* partition */ true)
      );
      await createPartitionIfNotExists(client, schema, table, customerId, 'last_modified_at');

      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      await client.query(`DROP TABLE IF EXISTS ${tempTable}`);
      await client.query(
        getCommonObjectSchemaSetupSql(category, commonObjectType)(schema, /* temp */ true, /* partition */ false)
      );
      await client.query(`CREATE INDEX IF NOT EXISTS pk_idx ON ${tempTable} (id ASC, last_modified_at DESC)`);

      const columns = getColumnsForCommonObject(category, commonObjectType);
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
          object: (value: object) => jsonStringifyWithoutNullChars(value),
          date: (value: Date) => value.toISOString(),
          string: (value: string) => stripNullCharsFromString(value),
        },
        quoted: true,
      });

      const mapper = getSnakecasedKeysMapper(category, commonObjectType);

      // Keep track of stuff
      let tempTableRowCount = 0;
      let maxLastModifiedAt: Date | null = null;

      childLogger.info('Importing common object records into temp table [IN PROGRESS]');
      await pipeline(
        inputStream,
        new Transform({
          objectMode: true,
          transform: (chunk, encoding, callback) => {
            try {
              const { record, emittedAt } = chunk;
              const unifiedData = mapper(record);
              const mappedRecord = {
                _supaglue_application_id: applicationId,
                _supaglue_provider_name: providerName,
                _supaglue_customer_id: customerId,
                _supaglue_emitted_at: emittedAt,
                _supaglue_unified_data: unifiedData,
                ...unifiedData,
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
      childLogger.info('Importing common object records into temp table [COMPLETED]');

      // Dedupe the temp table
      // Since all common objects have `lastModifiedAt`, we can sort by that to avoid dupes.
      // We need to do the sorting before applying OFFSET / LIMIT because otherwise, if a record
      // appears as the last record of a page and also the first record of the next page, we will
      // overwrite the newer record with the older record in the main table.
      childLogger.info('Writing deduped temp table records into deduped temp table [IN PROGRESS]');
      await client.query(
        `CREATE TEMP TABLE IF NOT EXISTS ${dedupedTempTable} AS SELECT * FROM ${tempTable} ORDER BY id ASC, last_modified_at DESC`
      );
      await client.query(`CREATE INDEX IF NOT EXISTS pk_idx ON ${dedupedTempTable} (id ASC, last_modified_at DESC)`);
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

      if (diffAndDeleteRecords) {
        childLogger.info('Marking rows as deleted [IN PROGRESS]');
        await client.query(`
        UPDATE ${qualifiedTable} AS destination
        SET is_deleted = TRUE
        WHERE 
          destination._supaglue_application_id = '${applicationId}' AND
          destination._supaglue_provider_name = '${providerName}' AND
          destination._supaglue_customer_id = '${customerId}'
        AND NOT EXISTS (
            SELECT 1
            FROM ${dedupedTempTable} AS temp
            WHERE temp.id = destination.id
        );
        `);
        childLogger.info('Marking rows as deleted [COMPLETED]');
        heartbeat();
      }

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
    connection: ConnectionSafeAny,
    object: string,
    inputStream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteObjectRecordsResult> {
    const { id: connectionId, providerName, customerId } = connection;
    return await this.#writeRecords(
      connection,
      getObjectTableName(connection.providerName, object),
      inputStream,
      heartbeat,
      logger.child({ connectionId, providerName, customerId, object }),
      diffAndDeleteRecords
    );
  }

  public override async upsertStandardObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    record: StandardFullObjectRecord
  ): Promise<void> {
    return;
  }

  public override async writeEntityRecords(
    connection: ConnectionSafeAny,
    entityName: string,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteEntityRecordsResult> {
    throw new NotImplementedError('Managed supaglue destination is not supported for entities');
  }

  public override async upsertEntityRecord(
    connection: ConnectionSafeAny,
    entityName: string,
    record: FullEntityRecord
  ): Promise<void> {
    throw new NotImplementedError('Managed supaglue destination is not supported for entities');
  }

  async #writeRecords(
    { providerName, customerId, applicationId }: ConnectionSafeAny,
    table: string,
    inputStream: Readable,
    heartbeat: () => void,
    childLogger: pino.Logger,
    diffAndDeleteRecords: boolean
  ): Promise<WriteObjectRecordsResult> {
    const schema = getSchemaName(applicationId);
    const qualifiedTable = `${schema}.${table}`;
    const tempTable = `temp_${table}`;
    const dedupedTempTable = `deduped_temp_${table}`;

    const client = await this.#getClient();

    try {
      // Create tables if necessary
      // TODO: We should only need to do this once at the beginning
      await client.query(getSchemaSetupSql(schema));
      await client.query(getTableSetupSql(table, schema));
      await createPartitionIfNotExists(client, schema, table, customerId, '_supaglue_last_modified_at');

      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      await client.query(`DROP TABLE IF EXISTS ${tempTable}`);
      await client.query(getTableSetupSql(table, schema, /* temp */ true));
      await client.query(
        `CREATE INDEX IF NOT EXISTS pk_idx ON ${tempTable} (_supaglue_id ASC, _supaglue_last_modified_at DESC)`
      );

      // TODO: Make this type-safe
      const columns = [
        '_supaglue_application_id',
        '_supaglue_provider_name',
        '_supaglue_customer_id',
        '_supaglue_id',
        '_supaglue_emitted_at',
        '_supaglue_last_modified_at',
        '_supaglue_is_deleted',
        '_supaglue_raw_data',
      ];
      const columnsToUpdate = columns.filter(
        (c) =>
          c !== '_supaglue_application_id' &&
          c !== '_supaglue_provider_name' &&
          c !== '_supaglue_customer_id' &&
          c !== '_supaglue_id'
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
          object: (value: object) => jsonStringifyWithoutNullChars(value),
          date: (value: Date) => value.toISOString(),
          string: (value: string) => stripNullCharsFromString(value),
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
          transform: (record: MappedListedObjectRecord, encoding, callback) => {
            try {
              const mappedRecord = {
                _supaglue_application_id: applicationId,
                _supaglue_provider_name: providerName,
                _supaglue_customer_id: customerId,
                _supaglue_id: record.id,
                _supaglue_emitted_at: record.emittedAt,
                _supaglue_last_modified_at: record.lastModifiedAt,
                _supaglue_is_deleted: record.isDeleted,
                _supaglue_raw_data: record.rawData,
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
      await client.query(`DROP TABLE IF EXISTS ${dedupedTempTable}`);
      await client.query(
        `CREATE TEMP TABLE ${dedupedTempTable} AS SELECT * FROM ${tempTable} ORDER BY _supaglue_id ASC, _supaglue_last_modified_at DESC`
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS pk_idx ON ${dedupedTempTable} (_supaglue_id ASC, _supaglue_last_modified_at DESC)`
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
SELECT DISTINCT ON (_supaglue_id) ${columns.join(',')} FROM ${dedupedTempTable} OFFSET ${offset} limit ${batchSize}
ON CONFLICT (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, _supaglue_id)
DO UPDATE SET (${columnsToUpdateStr}) = (${excludedColumnsToUpdateStr})`);
        childLogger.info({ offset }, 'Copying from deduped temp table to main table [COMPLETED]');
        heartbeat();
      }

      childLogger.info('Copying from deduped temp table to main table [COMPLETED]');

      if (shouldDeleteRecords(diffAndDeleteRecords, providerName)) {
        childLogger.info('Marking rows as deleted [IN PROGRESS]');
        await client.query(`
          UPDATE ${qualifiedTable} AS destination
          SET _supaglue_is_deleted = TRUE
          WHERE destination._supaglue_application_id = '${applicationId}'
          AND destination._supaglue_provider_name = '${providerName}'
          AND destination._supaglue_customer_id = '${customerId}'
          AND NOT EXISTS (
              SELECT 1
              FROM ${dedupedTempTable} AS temp
              WHERE temp._supaglue_id = destination._supaglue_id
          );
        `);
        childLogger.info('Marking rows as deleted [COMPLETED]');
      }

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

const getSchemaSetupSql = (schema: string) => {
  return `CREATE SCHEMA IF NOT EXISTS ${schema};`;
};

const getTableSetupSql = (baseTableName: string, schema: string, temp?: boolean) => {
  const tableName = temp ? `temp_${baseTableName}` : baseTableName;

  return `-- CreateTable
CREATE ${temp ? 'TEMP TABLE' : 'TABLE'} IF NOT EXISTS ${temp ? `${tableName}` : `"${schema}".${tableName}`} (
  "_supaglue_application_id" TEXT NOT NULL,
  "_supaglue_provider_name" TEXT NOT NULL,
  "_supaglue_customer_id" TEXT NOT NULL,
  "_supaglue_id" TEXT NOT NULL,
  "_supaglue_emitted_at" TIMESTAMP(3) NOT NULL,
  "_supaglue_last_modified_at" TIMESTAMP(3) NOT NULL,
  "_supaglue_is_deleted" BOOLEAN NOT NULL,
  "_supaglue_raw_data" JSONB NOT NULL

  ${
    temp
      ? ''
      : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "_supaglue_id")'
  }
    
)${temp ? ';' : ' PARTITION BY LIST ( _supaglue_customer_id );'}`;
};

function stripNullCharsFromString(str: string) {
  return str.replace(/\0/g, '');
}

function jsonStringifyWithoutNullChars(obj: object) {
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'string') {
      return stripNullCharsFromString(value);
    }
    return value;
  });
}
