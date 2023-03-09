import { PrismaClient } from '@supaglue/db';
import { stringify } from 'csv-stringify';
import { Pool } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import { RemoteService } from '../remote_service';

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
    remoteCommonModels: T[],
    table: string,
    tempTable: string,
    columnsWithoutId: string[],
    mapper: (connectionId: string, customerId: string, remoteCommonModel: T) => Record<string, any>
  ): Promise<void> {
    const client = await this.pgPool.connect();

    // TODO: On the first run, we should be able to directly write into the table and skip the temp table

    try {
      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper
      // so that we can resume in the case of failure during the COPY stage.
      // TODO: Maybe we don't need to include all
      await client.query(`CREATE TEMP TABLE IF NOT EXISTS ${tempTable} (LIKE ${table} INCLUDING ALL)`);
      const columns = ['id', ...columnsWithoutId];

      // Output
      const stream = client.query(
        copyFrom(`COPY ${tempTable} (${columns.join(',')}) FROM STDIN WITH (DELIMITER ',', FORMAT CSV)`)
      );

      // Input
      const mappedRemoteCommonModels = remoteCommonModels.map((remoteCommonModel) =>
        mapper(connectionId, customerId, remoteCommonModel)
      );

      await new Promise((resolve, reject) => {
        const csvInput = stringify(mappedRemoteCommonModels, {
          columns: columns,
          cast: {
            boolean: (value: boolean) => value.toString(),
          },
        });
        csvInput.on('error', reject);
        stream.on('error', reject);
        stream.on('finish', resolve);
        csvInput.pipe(stream);
      });

      // Copy from temp table
      const columnsToUpdate = columnsWithoutId.join(',');
      const excludedDolumnsToUpdate = columnsWithoutId.map((column) => `EXCLUDED.${column}`).join(',');
      await client.query(`INSERT INTO ${table}
SELECT * FROM ${tempTable}
ON CONFLICT (connection_id, remote_id)
DO UPDATE SET (${columnsToUpdate}) = (${excludedDolumnsToUpdate})`);
    } finally {
      client.release();
    }
  }
}
