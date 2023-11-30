import type {
  BaseFullRecord,
  CommonObjectType,
  CommonObjectTypeForCategory,
  CommonObjectTypeMapForCategory,
  ConnectionSafeAny,
  MappedListedObjectRecord,
  ProviderCategory,
} from '@supaglue/types';
import type { CRMCommonObjectType } from '@supaglue/types/crm';
import type { EngagementCommonObjectType } from '@supaglue/types/engagement';
import { stringify } from 'csv-stringify';
import type { PoolClient } from 'pg';
import { from as copyFrom } from 'pg-copy-streams';
import type { pino } from 'pino';
import type { Readable } from 'stream';
import { Transform } from 'stream';
import { pipeline } from 'stream/promises';
import {
  keysOfSnakecasedCrmAccountWithTenant,
  keysOfSnakecasedCrmContactWithTenant,
  keysOfSnakecasedCrmUserWithTenant,
  keysOfSnakecasedLeadWithTenant,
  keysOfSnakecasedOpportunityWithTenant,
} from '../keys/crm';
import { keysOfSnakecasedEngagementAccountWithTenant } from '../keys/engagement/account';
import { keysOfSnakecasedEngagementContactWithTenant } from '../keys/engagement/contact';
import { keysOfSnakecasedMailboxWithTenant } from '../keys/engagement/mailbox';
import { keysOfSnakecasedSequenceWithTenant } from '../keys/engagement/sequence';
import { keysOfSnakecasedSequenceStateWithTenant } from '../keys/engagement/sequence_state';
import { keysOfSnakecasedSequenceStepWithTenant } from '../keys/engagement/sequence_step';
import { keysOfSnakecasedEngagementUserWithTenant } from '../keys/engagement/user';
import { logger, omit } from '../lib';
import type { WriteCommonObjectRecordsResult, WriteObjectRecordsResult } from './base';
import {
  getSnakecasedKeysMapper,
  jsonStringifyWithoutNullChars,
  shouldDeleteRecords,
  stripNullCharsFromString,
} from './util';

export const kCustomObject = 'custom_objects';
export type ObjectType = 'standard' | 'custom';

export class PostgresDestinationWriterImpl {
  async upsertCommonObjectRecordImpl<P extends ProviderCategory, T extends CommonObjectTypeForCategory<P>>(
    client: PoolClient,
    { providerName, customerId, category, applicationId }: ConnectionSafeAny,
    commonObjectType: T,
    record: CommonObjectTypeMapForCategory<P>['object'],
    schema: string,
    table: string,
    setup: () => Promise<void>
  ): Promise<void> {
    if (category === 'no_category' || !commonObjectType) {
      throw new Error(`Common objects not supported for provider: ${providerName}`);
    }
    const qualifiedTable = `"${schema}".${table}`;
    const childLogger = logger.child({ providerName, customerId, commonObjectType });

    try {
      await setup();

      const columns = getColumnsForCommonObject(category, commonObjectType);
      const columnsToUpdate = columns.filter(
        (c) =>
          c !== '_supaglue_application_id' &&
          c !== '_supaglue_provider_name' &&
          c !== '_supaglue_customer_id' &&
          c !== 'id'
      );

      const mapper = getSnakecasedKeysMapper(category, commonObjectType);

      const unifiedData = mapper(record);
      const mappedRecord = {
        _supaglue_application_id: applicationId,
        _supaglue_provider_name: providerName,
        _supaglue_customer_id: customerId,
        _supaglue_emitted_at: new Date(),
        _supaglue_unified_data: omit(unifiedData, ['raw_data']),
        ...unifiedData,
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
          return jsonStringifyWithoutNullChars(value);
        }

        if (typeof value === 'string') {
          return stripNullCharsFromString(value);
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
    } catch (err) {
      childLogger.error({ err }, 'Error upserting common object record');
      throw err;
    } finally {
      client.release();
    }
  }

  async writeCommonObjectRecordsImpl(
    client: PoolClient,
    { id: connectionId, providerName, customerId, category, applicationId }: ConnectionSafeAny,
    commonObjectType: CommonObjectType,
    inputStream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean,
    schema: string,
    table: string,
    setup: () => Promise<void>
  ): Promise<WriteCommonObjectRecordsResult> {
    const childLogger = logger.child({ connectionId, providerName, customerId, commonObjectType });
    const qualifiedTable = `"${schema}".${table}`;
    const tempTable = `temp_${table}`;

    try {
      await setup();

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
                _supaglue_unified_data: omit(unifiedData, ['raw_data']),
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
SELECT DISTINCT ON (id) ${columns.join(
          ','
        )} FROM ${tempTable} ORDER BY id ASC, last_modified_at DESC OFFSET ${offset} LIMIT ${batchSize}
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
            FROM ${tempTable} AS temp
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

  async upsertRecordImpl(
    client: PoolClient,
    { providerName, customerId, applicationId }: ConnectionSafeAny,
    schema: string,
    objectName: string,
    record: BaseFullRecord,
    setup: () => Promise<void>,
    objectType: 'standard' | 'custom'
  ): Promise<void> {
    const table = objectType === 'standard' ? objectName : kCustomObject;
    const qualifiedTable = `"${schema}".${table}`;
    const childLogger = logger.child({ providerName, customerId });

    try {
      await setup();

      const mappedRecord: Record<string, string | boolean | object | null> = {
        _supaglue_application_id: applicationId,
        _supaglue_provider_name: providerName,
        _supaglue_customer_id: customerId,
        _supaglue_id: record.id,
        _supaglue_emitted_at: new Date(),
        _supaglue_last_modified_at: record.metadata.lastModifiedAt,
        _supaglue_is_deleted: record.metadata.isDeleted,
        _supaglue_raw_data: record.rawData,
        _supaglue_mapped_data: {},
        ...(objectType === 'custom' ? { _supaglue_object_name: objectName } : {}),
      };
      const columns = Object.keys(mappedRecord);
      const columnsToUpdate = columns.filter(
        (c) =>
          c !== '_supaglue_application_id' &&
          c !== '_supaglue_provider_name' &&
          c !== '_supaglue_customer_id' &&
          c !== '_supaglue_id' &&
          c !== '_supaglue_object_name'
      );

      const columnsStr = columns.join(',');
      const columnPlaceholderValuesStr = columns.map((column, index) => `$${index + 1}`).join(',');
      const columnsToUpdateStr = columnsToUpdate.join(',');
      const excludedColumnsToUpdateStr = columnsToUpdate.map((column) => `EXCLUDED.${column}`).join(',');
      const values = columns.map((column) => {
        const value = mappedRecord[column];
        // pg doesn't seem to convert objects to JSON even though the docs say it does
        // https://node-postgres.com/features/queries
        if (value !== null && value !== undefined && typeof value === 'object') {
          return jsonStringifyWithoutNullChars(value);
        }

        if (typeof value === 'string') {
          return stripNullCharsFromString(value);
        }

        return value;
      });
      const maybeObjectNameColumn = objectType === 'custom' ? ', _supaglue_object_name' : '';
      await client.query(
        `INSERT INTO ${qualifiedTable} (${columnsStr})
VALUES
  (${columnPlaceholderValuesStr})
ON CONFLICT (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, _supaglue_id${maybeObjectNameColumn})
DO UPDATE SET (${columnsToUpdateStr}) = (${excludedColumnsToUpdateStr})`,
        values
      );
    } catch (err) {
      childLogger.error({ err }, 'Error upserting record');
      throw err;
    } finally {
      client.release();
    }
  }

  async writeRecordsImpl(
    client: PoolClient,
    { providerName, customerId, applicationId }: ConnectionSafeAny,
    schema: string,
    objectName: string,
    inputStream: Readable,
    heartbeat: () => void,
    childLogger: pino.Logger,
    diffAndDeleteRecords: boolean,
    setup: () => Promise<void>,
    objectType: 'standard' | 'custom'
  ): Promise<WriteObjectRecordsResult> {
    const table = objectType === 'standard' ? objectName : kCustomObject;
    const qualifiedTable = `"${schema}".${table}`;
    const tempTable = `"temp_${table}"`;

    try {
      await setup();

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
        // This is used to support entities + schemas. We should write empty object otherwise (e.g. for managed destinations).
        '_supaglue_mapped_data',
        ...(objectType === 'custom' ? ['_supaglue_object_name'] : []),
      ];
      const columnsToUpdate = columns.filter(
        (c) =>
          c !== '_supaglue_application_id' &&
          c !== '_supaglue_provider_name' &&
          c !== '_supaglue_customer_id' &&
          c !== '_supaglue_id' &&
          c !== '_supaglue_object_name'
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
                _supaglue_mapped_data: {},
                _supaglue_object_name: objectName,
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

      heartbeat();

      // Copy from deduped temp table
      const columnsToUpdateStr = columnsToUpdate.join(',');
      const excludedColumnsToUpdateStr = columnsToUpdate.map((column) => `EXCLUDED.${column}`).join(',');
      const maybeObjectNameColumn = objectType === 'custom' ? ', _supaglue_object_name' : '';
      // Paginate
      const batchSize = 10000;
      for (let offset = 0; offset < tempTableRowCount; offset += batchSize) {
        childLogger.info({ offset }, 'Copying from deduped temp table to main table [IN PROGRESS]');
        // IMPORTANT: we need to use DISTINCT ON because we may have multiple records with the same id
        // For example, hubspot will return the same record twice when querying for `archived: true` if
        // the record was archived, restored, and archived again.
        // TODO: This may have performance implications. We should look into this later.
        // https://github.com/supaglue-labs/supaglue/issues/497
        const supaglueId = `_supaglue_id${maybeObjectNameColumn}`;
        await client.query(`INSERT INTO ${qualifiedTable} (${columns.join(',')})
SELECT DISTINCT ON (${supaglueId}) ${columns.join(
          ','
        )} FROM ${tempTable} ORDER BY ${supaglueId} ASC, _supaglue_last_modified_at DESC OFFSET ${offset} limit ${batchSize}
ON CONFLICT (_supaglue_application_id, _supaglue_provider_name, _supaglue_customer_id, ${supaglueId})
DO UPDATE SET (${columnsToUpdateStr}) = (${excludedColumnsToUpdateStr})`);
        childLogger.info({ offset }, 'Copying from deduped temp table to main table [COMPLETED]');
        heartbeat();
      }

      childLogger.info('Copying from deduped temp table to main table [COMPLETED]');

      // TODO: Watch for sql-injection attack around custom object name.... we should probably use a better
      // sql library so we are not templating raw SQL strings
      if (shouldDeleteRecords(diffAndDeleteRecords, providerName)) {
        childLogger.info('Marking rows as deleted [IN PROGRESS]');
        await client.query(`
          UPDATE ${qualifiedTable} AS destination
          SET _supaglue_is_deleted = TRUE
          WHERE
            destination._supaglue_application_id = '${applicationId}' AND
            destination._supaglue_provider_name = '${providerName}' AND
            destination._supaglue_customer_id = '${customerId}'
            ${objectType === 'custom' ? `AND destination._supaglue_object_name = '${objectName}'` : ''}
          AND NOT EXISTS (
              SELECT 1
              FROM ${tempTable} AS temp
              WHERE temp._supaglue_id = destination._supaglue_id
              
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
}

const getColumnsForCommonObject = (category: ProviderCategory, commonObjectType: CommonObjectType) => {
  if (category === 'crm') {
    return columnsByCommonObjectType.crm[commonObjectType as CRMCommonObjectType];
  }
  return columnsByCommonObjectType.engagement[commonObjectType as EngagementCommonObjectType];
};

const columnsByCommonObjectType: {
  crm: Record<CRMCommonObjectType, string[]>;
  engagement: Record<EngagementCommonObjectType, string[]>;
} = {
  crm: {
    account: keysOfSnakecasedCrmAccountWithTenant,
    contact: keysOfSnakecasedCrmContactWithTenant,
    lead: keysOfSnakecasedLeadWithTenant,
    opportunity: keysOfSnakecasedOpportunityWithTenant,
    user: keysOfSnakecasedCrmUserWithTenant,
  },
  engagement: {
    account: keysOfSnakecasedEngagementAccountWithTenant,
    contact: keysOfSnakecasedEngagementContactWithTenant,
    sequence_state: keysOfSnakecasedSequenceStateWithTenant,
    sequence_step: keysOfSnakecasedSequenceStepWithTenant,
    user: keysOfSnakecasedEngagementUserWithTenant,
    sequence: keysOfSnakecasedSequenceWithTenant,
    mailbox: keysOfSnakecasedMailboxWithTenant,
  },
};
