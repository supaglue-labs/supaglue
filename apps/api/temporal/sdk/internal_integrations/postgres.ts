import { PostgresInternalIntegration as PostgresInternalIntegrationConfig } from '@supaglue/types';
import { ApplicationFailure } from '@temporalio/client';
import retry from 'async-retry';
import pg from 'pg';
import { BaseInternalIntegration } from './base';

export class PostgresInternalIntegration extends BaseInternalIntegration {
  public constructor(...args: ConstructorParameters<typeof BaseInternalIntegration>) {
    super(...args);
  }

  public async query(
    // TODO: shouldn't need to pass this in at query time
    postgres: PostgresInternalIntegrationConfig,
    sql: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    values?: any[]
    // TODO: Come up with better type for return value
  ): Promise<Record<string, string>[]> {
    // TODO: We should consider defining internalIntegrations separately
    // from SyncConfig so that this can be reused.
    const pool = new pg.Pool(postgres.config.credentials);
    try {
      return await retry(async () => {
        const { rows } = await pool.query(sql, values);
        return rows;
      }, postgres.retryPolicy);
    } catch (err: unknown) {
      throw ApplicationFailure.nonRetryable(err instanceof Error ? err.message : '', 'sync_destination_error');
    } finally {
      await pool.end(); // TODO: should not be ending on every query
    }
  }
}
