import type { PrismaClient } from '@supaglue/db';
import { stringify } from 'csv-stringify';
import type { Pool } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import type { Readable } from 'stream';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { logger } from '../../lib';
import type { RemoteService } from '../remote_service';

export abstract class CommonObjectBaseService {
  // TODO: Use just pg for common objects?
  protected readonly pgPool: Pool;
  protected readonly prisma: PrismaClient;
  protected readonly remoteService: RemoteService;

  // setting constructor as public so that we can use `ConstructorParameters` in child classes
  public constructor(pgPool: Pool, prisma: PrismaClient, remoteService: RemoteService) {
    this.pgPool = pgPool;
    this.prisma = prisma;
    this.remoteService = remoteService;
  }

  abstract upsertRemoteRecords(
    connectionId: string,
    customerId: string,
    remoteRecordsReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonObjectsResult>;

  // TODO: this needs to be cleaned up a bit. this may become more type-safe
  // when/if we introduce a prisma generator to generate the db types/mappers
  protected async upsertRemoteCommonObjects<T>(
    connectionId: string,
    customerId: string,
    remoteCommonObjectReadable: Readable,
    table: string,
    tempTable: string,
    columnsWithoutId: string[],
    mapper: (connectionId: string, customerId: string, remoteCommonObject: T) => Record<string, any>,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonObjectsResult> {
    const client = await this.pgPool.connect();

    // TODO: On the first run, we should be able to directly write into the table and skip the temp table

    try {
      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper
      // so that we can resume in the case of failure during the COPY stage.
      logger.info(
        { connectionId, customerId, table },
        'Creating temp table for importing common object records [IN PROGRESS]'
      );
      await client.query(`CREATE TEMP TABLE IF NOT EXISTS ${tempTable} (LIKE ${table} INCLUDING DEFAULTS)`);
      await client.query(`CREATE INDEX IF NOT EXISTS ${tempTable}_remote_id_idx ON ${tempTable} (remote_id)`);
      logger.info(
        { connectionId, customerId, table },
        'Creating temp table for importing common object records [COMPLETED]'
      );

      const columns = ['id', ...columnsWithoutId];

      // Output
      const stream = client.query(
        copyFrom(`COPY ${tempTable} (${columns.join(',')}) FROM STDIN WITH (DELIMITER ',', FORMAT CSV)`)
      );

      // Input
      const stringifier = stringify({
        columns,
        cast: {
          boolean: (value: boolean) => value.toString(),
        },
        quoted: true,
      });

      // Keep track of stuff
      let tempTableRowCount = 0;
      let maxLastModifiedAt: Date | null = null;

      logger.info({ connectionId, customerId, table }, 'Importing common object records into temp table [IN PROGRESS]');
      await pipeline(
        remoteCommonObjectReadable,
        new Transform({
          objectMode: true,
          transform: (chunk, encoding, callback) => {
            try {
              const { record } = chunk;

              const mappedRecord = mapper(connectionId, customerId, record);

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
      logger.info({ connectionId, customerId, table }, 'Importing common object records into temp table [COMPLETED]');

      // Copy from temp table
      logger.info(
        { connectionId, customerId, table, offset: null },
        'Copying from temp table to main table [IN PROGRESS]'
      );
      const columnsToUpdate = columnsWithoutId.join(',');
      const excludedColumnsToUpdate = columnsWithoutId.map((column) => `EXCLUDED.${column}`).join(',');

      // Paginate
      const batchSize = 10000;
      for (let offset = 0; offset < tempTableRowCount; offset += batchSize) {
        logger.info({ connectionId, customerId, table, offset }, 'Copying from temp table to main table [IN PROGRESS]');
        // IMPORTANT: we need to use DISTINCT ON because we may have multiple records with the same remote_id
        // For example, hubspot will return the same record twice when querying for `archived: true` if
        // the record was archived, restored, and archived again.
        // TODO: This may have performance implications. We should look into this later.
        // https://github.com/supaglue-labs/supaglue/issues/497
        await client.query(`INSERT INTO ${table}
SELECT DISTINCT ON (remote_id) * FROM (SELECT * FROM ${tempTable} ORDER BY remote_id OFFSET ${offset} limit ${batchSize}) AS batch
ON CONFLICT (connection_id, remote_id)
DO UPDATE SET (${columnsToUpdate}) = (${excludedColumnsToUpdate})`);
        logger.info({ connectionId, customerId, table, offset }, 'Copying from temp table to main table [COMPLETED]');
        onUpsertBatchCompletion(offset, tempTableRowCount);
      }

      logger.info({ connectionId, customerId, table }, 'Copying from temp table to main table [COMPLETED]');

      return {
        maxLastModifiedAt,
        numRecords: tempTableRowCount, // TODO: not quite accurate (because there can be duplicates) but good enough
      };
    } finally {
      client.release();
    }
  }
}

export type UpsertRemoteCommonObjectsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};
