import { ApplicationFailure } from '@temporalio/client';
import retry from 'async-retry';
import pg from 'pg';
import { PostgresDestination } from '../../../developer_config/entities';
import { BaseInternalIntegration } from './base';

export class PostgresInternalIntegration extends BaseInternalIntegration {
  public constructor(...args: ConstructorParameters<typeof BaseInternalIntegration>) {
    super(...args);
  }

  public async query(
    destination: PostgresDestination, // TODO: shouldn't need to pass this in at query time
    sql: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values?: any[]
  ): Promise<void> {
    // TODO: We should consider defining internalIntegrations separately
    // from SyncConfig so that this can be reused.
    const pool = new pg.Pool(destination.config.credentials);
    try {
      await retry(async () => {
        await pool.query(sql, values);
      }, destination.retryPolicy);
    } catch (err: unknown) {
      throw ApplicationFailure.nonRetryable(err instanceof Error ? err.message : '', 'sync_destination_error');
    }
    await pool.end(); // TODO: should not be ending on every query
  }
}
