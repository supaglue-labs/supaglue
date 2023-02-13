import {
  PostgresDestination,
  PostgresInternalIntegration as PostgresInternalIntegrationConfig,
  PostgresSource,
} from '@supaglue/types';
import { ApplicationFailure } from '@temporalio/client';
import retry from 'async-retry';
import pg from 'pg';
import { getMapping, mapCustomerToInternalRecords } from '../../lib';
import { BaseInternalIntegration } from './base';

class PostgresInternalIntegration extends BaseInternalIntegration {
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

export class SourcePostgresInternalIntegration extends PostgresInternalIntegration {
  public async readAllObjectType() {
    const source = this.syncConfig.source as PostgresSource;

    const dbFields = source.schema.fields.map((field) => field.name);
    const dbFieldsString = dbFields.join(', ');

    const sql = `SELECT
    ${dbFieldsString}
  FROM ${source.config.table}
  WHERE ${source.config.customerIdColumn} = '${this.sync.customerId}'`;

    return await this.query(source, sql);
  }
}

export class DestinationPostgresInternalIntegration extends PostgresInternalIntegration {
  public async insertRecords(records: any[]) {
    const { sync, syncConfig } = this;

    const fieldMapping = getMapping(sync, syncConfig);
    const internalRecords = mapCustomerToInternalRecords(fieldMapping, records);
    if (!internalRecords.length) {
      throw new Error('No records to write');
    }

    // TODO: make the class take in a generic for SyncConfig instead of asserting
    const destination = syncConfig.destination as PostgresDestination;

    // TODO: What do we do if there are columns missing in the source?
    // TODO: Check that there are actually columns to sync over
    const { customPropertiesColumn, upsertKey } = destination.config;

    const normalizedFields = destination.schema.fields.map((field) => field.name);
    const dbFields = Object.keys(fieldMapping).filter((field) => normalizedFields.includes(field));
    const customFields = Object.keys(fieldMapping).filter((field) => !normalizedFields.includes(field));

    const hasCustomFields = !!customPropertiesColumn && customFields.length;
    if (hasCustomFields) {
      dbFields.push(customPropertiesColumn);
    }

    const dbFieldsWithoutPrimaryKey = dbFields.filter((field) => field !== upsertKey);
    const dbFieldsString = dbFields.map((field) => `"${field}"`).join(', ');
    const dbFieldsWithoutPrimaryKeyString = dbFieldsWithoutPrimaryKey.map((field) => `"${field}"`).join(', ');

    const dbFieldsIndexesString = dbFields.map((_, idx) => `$${idx + 1}`).join(', ');
    const dbFieldsIndexesWithoutPrimaryKeyString = dbFields
      .map((field, index) => {
        if (field !== upsertKey) {
          return `$${index + 1}`;
        }
      })
      .filter(Boolean)
      .join(', ');

    // TODO: Do this in batches
    for (const mappedRecord of internalRecords) {
      const values = normalizedFields.map((field) => mappedRecord[field] ?? '');

      if (hasCustomFields) {
        const customPropertiesMapping: Record<string, any> = {};
        customFields.forEach((field) => {
          customPropertiesMapping[field] = mappedRecord[field] ?? '';
        });
        values.push(customPropertiesMapping);
      }

      // TODO: Do we want to deal with updated_at and created_at?
      await this.query(
        destination,
        `
      INSERT INTO
        ${destination.config.table} (${dbFieldsString}, ${destination.config.customerIdColumn}, created_at, updated_at)
      VALUES
        (${dbFieldsIndexesString}, '${sync.customerId}', now(), now())
      ON CONFLICT (${destination.config.upsertKey}, ${destination.config.customerIdColumn})
      DO
        UPDATE SET (${dbFieldsWithoutPrimaryKeyString}, created_at, updated_at) = (${dbFieldsIndexesWithoutPrimaryKeyString}, now(), now())
      `,
        values
      );
    }
  }
}
