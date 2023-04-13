import { PrismaClient } from '@supaglue/db';
import { stringify } from 'csv-stringify';
import { Pool } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { logger } from '../../lib';
import { RemoteService } from '../remote_service';

export const ORDER_BY = [
  {
    lastModifiedAt: 'asc' as const,
  },
  {
    id: 'asc' as const,
  },
];

export abstract class CommonModelBaseService {
  // TODO: Use just pg for common models?
  protected readonly pgPool: Pool;
  protected readonly prisma: PrismaClient;
  protected readonly remoteService: RemoteService;

  // setting constructor as public so that we can use `ConstructorParameters` in child classes
  public constructor(pgPool: Pool, prisma: PrismaClient, remoteService: RemoteService) {
    this.pgPool = pgPool;
    this.prisma = prisma;
    this.remoteService = remoteService;
  }

  // TODO: this needs to be cleaned up a bit. this may become more type-safe
  // when/if we introduce a prisma generator to generate the db types/mappers
  protected async upsertRemoteCommonModels<T>(
    connectionId: string,
    customerId: string,
    remoteCommonModelReadable: Readable,
    table: string,
    tempTable: string,
    columnsWithoutId: string[],
    mapper: (connectionId: string, customerId: string, remoteCommonModel: T) => Record<string, any>,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const client = await this.pgPool.connect();

    // TODO: On the first run, we should be able to directly write into the table and skip the temp table

    try {
      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper
      // so that we can resume in the case of failure during the COPY stage.
      logger.info(
        { connectionId, customerId, table },
        'Creating temp table for importing common model objects [IN PROGRESS]'
      );
      await client.query(`CREATE TEMP TABLE IF NOT EXISTS ${tempTable} (LIKE ${table} INCLUDING DEFAULTS)`);
      await client.query(`CREATE INDEX IF NOT EXISTS ${tempTable}_remote_id_idx ON ${tempTable} (remote_id)`);
      logger.info(
        { connectionId, customerId, table },
        'Creating temp table for importing common model objects [COMPLETED]'
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
      });

      // Keep track of stuff
      let tempTableRowCount = 0;
      let maxLastModifiedAt: Date | null = null;

      logger.info({ connectionId, customerId, table }, 'Importing common model objects into temp table [IN PROGRESS]');
      await pipeline(
        remoteCommonModelReadable,
        new Transform({
          objectMode: true,
          transform: (chunk, encoding, callback) => {
            try {
              const mappedRecord = mapper(connectionId, customerId, chunk);

              ++tempTableRowCount;

              // Update the max lastModifiedAt
              const lastModifiedAt = getLastModifiedAt(chunk);
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
      logger.info({ connectionId, customerId, table }, 'Importing common model objects into temp table [COMPLETED]');

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

export type UpsertRemoteCommonModelsResult = {
  maxLastModifiedAt: Date | null;
  numRecords: number;
};

export function getLastModifiedAt(remoteCommonModel: {
  remoteUpdatedAt: Date | null;
  detectedOrRemoteDeletedAt: Date | null;
}) {
  return new Date(
    Math.max(
      remoteCommonModel.remoteUpdatedAt?.getTime() || 0,
      remoteCommonModel.detectedOrRemoteDeletedAt?.getTime() || 0
    )
  );
}
