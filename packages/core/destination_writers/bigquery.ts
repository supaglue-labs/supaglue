import type { TableSchema } from '@google-cloud/bigquery';
import { BigQuery } from '@google-cloud/bigquery';
import { ApiError } from '@google-cloud/common';
import type {
  BigQueryDestination,
  CommonObjectType,
  CommonObjectTypeForCategory,
  CommonObjectTypeMapForCategory,
  ConnectionSafeAny,
  NormalizedRawRecord,
  ProviderCategory,
  ProviderName,
} from '@supaglue/types';
import type { CRMCommonObjectType } from '@supaglue/types/crm';
import type { EngagementCommonObjectType } from '@supaglue/types/engagement';
import { snakecaseKeys } from '@supaglue/utils';
import { stringify } from 'csv-stringify';
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
import { keysOfSnakecasedEngagementContactWithTenant } from '../keys/engagement/contact';
import { keysOfSnakecasedMailboxWithTenant } from '../keys/engagement/mailbox';
import { keysOfSnakecasedSequenceWithTenant } from '../keys/engagement/sequence';
import { keysOfSnakecasedSequenceStateWithTenant } from '../keys/engagement/sequence_state';
import { keysOfSnakecasedEngagementUserWithTenant } from '../keys/engagement/user';
import { logger } from '../lib';
import type { WriteCommonObjectRecordsResult, WriteObjectRecordsResult } from './base';
import { BaseDestinationWriter } from './base';
import { getSnakecasedKeysMapper } from './util';

export class BigQueryDestinationWriter extends BaseDestinationWriter {
  readonly #destination: BigQueryDestination;

  public constructor(destination: BigQueryDestination) {
    super();
    this.#destination = destination;
  }

  async #getClient(): Promise<BigQuery> {
    return new BigQuery({
      ...this.#destination.config,
      credentials: snakecaseKeys(this.#destination.config.credentials),
    });
  }

  public override async upsertCommonObjectRecord<P extends ProviderCategory, T extends CommonObjectTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonObjectType: T,
    record: CommonObjectTypeMapForCategory<P>['object']
  ): Promise<void> {
    // do nothing
    return;
  }

  public override async writeCommonObjectRecords(
    { id: connectionId, providerName, customerId, category, applicationId }: ConnectionSafeAny,
    commonObjectType: CommonObjectType,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonObjectRecordsResult> {
    const childLogger = logger.child({ connectionId, providerName, customerId, commonObjectType });

    const { dataset } = this.#destination.config;
    const table = getCommonObjectTableName(category, commonObjectType);
    const qualifiedTable = `${dataset}.${table}`;
    const tempTable = `_temp_${providerName}_${table}`;
    const qualifiedTempTable = `${dataset}.${tempTable}`;

    const client = await this.#getClient();

    // Create table if necessary
    // TODO: We should only need to do this once at the beginning
    try {
      await client.dataset(dataset).createTable(table, { schema: getCommonObjectSchema(category, commonObjectType) });
    } catch (e) {
      if (e instanceof ApiError && e.code === 409) {
        // Table already exists, noop
      } else {
        throw e;
      }
    }

    const columns = getColumnsForCommonObject(category, commonObjectType);
    const columnsToUpdate = columns.filter(
      (c) =>
        c !== '_supaglue_application_id' &&
        c !== '_supaglue_provider_name' &&
        c !== '_supaglue_customer_id' &&
        c !== 'id'
    );

    // Output
    const stream = client
      .dataset(dataset)
      .table(tempTable)
      .createWriteStream({
        sourceFormat: 'CSV',
        createDisposition: 'CREATE_IF_NEEDED',
        writeDisposition: 'WRITE_TRUNCATE',
        schema: getCommonObjectSchema(category, commonObjectType),
      });

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

    const mapper = getSnakecasedKeysMapper(category, commonObjectType);

    // Keep track of stuff
    let tempTableRowCount = 0;
    let maxLastModifiedAt: Date | null = null;

    childLogger.info({ tempTable }, 'Importing common object objects into temp table [IN PROGRESS]');
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
    childLogger.info({ tempTable }, 'Importing common object objects into temp table [COMPLETED]');

    heartbeat();

    // Copy from deduped temp table
    childLogger.info({ table, tempTable }, 'Copying from deduped temp table to main table [IN PROGRESS]');
    // IMPORTANT: we need to use `QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY last_modified_at DESC) = 1)`
    // because we may have multiple records with the same id
    // For example, hubspot will return the same record twice when querying for `archived: true` if
    // the record was archived, restored, and archived again.
    // TODO: This may have performance implications. We should look into this later.
    // https://github.com/supaglue-labs/supaglue/issues/497
    await client.query(`
-- Upsert into ${qualifiedTable}
    MERGE INTO ${qualifiedTable} AS table USING (SELECT ${columns.join(
      ','
    )} FROM (SELECT * FROM ${qualifiedTempTable} QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY last_modified_at DESC) = 1)) AS temp
ON table._supaglue_application_id = temp._supaglue_application_id
  AND table._supaglue_provider_name = temp._supaglue_provider_name
  AND table._supaglue_customer_id = temp._supaglue_customer_id
  AND table.id = temp.id
WHEN NOT MATCHED THEN INSERT (${columns.join(',')}) VALUES (${columns.map((col) => `temp.${col}`).join(', ')})
WHEN MATCHED THEN UPDATE SET ${columnsToUpdate.map((col) => `${col} = temp.${col}`).join(', ')}`);
    childLogger.info('Copying from deduped temp table to main table [COMPLETED]');
    heartbeat();

    // Delete temp table
    childLogger.info({ tempTable }, 'Deleting temp table [IN PROGRESS]');
    await client.dataset(dataset).table(tempTable).delete();
    childLogger.info({ tempTable }, 'Deleting temp table [COMPLETED]');

    childLogger.info(
      { table, providerName, customerId, commonObjectType, maxLastModifiedAt, tempTableRowCount },
      'Sync completed'
    );

    return {
      maxLastModifiedAt,
      numRecords: tempTableRowCount, // TODO: not quite accurate (because there can be duplicates) but good enough
    };
  }

  public override async writeObjectRecords(
    { id: connectionId, providerName, customerId, applicationId }: ConnectionSafeAny,
    object: string,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteObjectRecordsResult> {
    const childLogger = logger.child({ connectionId, providerName, customerId, object });

    const { dataset } = this.#destination.config;
    const table = getObjectTableName(providerName, object);
    const qualifiedTable = `${dataset}.${table}`;
    const tempTable = `_temp_${providerName}_${table}`;
    const qualifiedTempTable = `${dataset}.${tempTable}`;

    const client = await this.#getClient();

    // Create table if necessary
    // TODO: We should only need to do this once at the beginning
    try {
      await client.dataset(dataset).createTable(table, { schema: getObjectSchema() });
    } catch (e) {
      if (e instanceof ApiError && e.code === 409) {
        // Table already exists, noop
      } else {
        throw e;
      }
    }

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
    const stream = client
      .dataset(dataset)
      .table(tempTable)
      .createWriteStream({
        sourceFormat: 'CSV',
        createDisposition: 'CREATE_IF_NEEDED',
        writeDisposition: 'WRITE_TRUNCATE',
        schema: getObjectSchema(/* temp: */ true),
      });

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

    childLogger.info({ tempTable }, 'Importing raw records into temp table [IN PROGRESS]');
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
    childLogger.info({ tempTable }, 'Importing raw records into temp table [COMPLETED]');

    heartbeat();

    // Copy from deduped temp table
    childLogger.info({ table, tempTable }, 'Copying from deduped temp table to main table [IN PROGRESS]');
    // IMPORTANT: we need to use `QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY last_modified_at DESC) = 1)`
    // because we may have multiple records with the same id
    // For example, hubspot will return the same record twice when querying for `archived: true` if
    // the record was archived, restored, and archived again.
    // TODO: This may have performance implications. We should look into this later.
    // https://github.com/supaglue-labs/supaglue/issues/497
    await client.query(`
-- Upsert into ${qualifiedTable}
    MERGE INTO ${qualifiedTable} AS table USING (SELECT ${columns.join(
      ','
    )} FROM (SELECT * FROM ${qualifiedTempTable} QUALIFY ROW_NUMBER() OVER (PARTITION BY id ORDER BY _supaglue_last_modified_at DESC) = 1)) AS temp
ON table._supaglue_application_id = temp._supaglue_application_id
  AND table._supaglue_provider_name = temp._supaglue_provider_name
  AND table._supaglue_customer_id = temp._supaglue_customer_id
  AND table.id = temp.id
WHEN NOT MATCHED THEN INSERT (${columns.join(',')}) VALUES (${columns.map((col) => `temp.${col}`).join(', ')})
WHEN MATCHED THEN UPDATE SET ${columnsToUpdate.map((col) => `${col} = temp.${col}`).join(', ')}`);
    heartbeat();

    childLogger.info({ table, tempTable }, 'Copying from deduped temp table to main table [COMPLETED]');

    childLogger.info(
      { table, providerName, customerId, object, maxLastModifiedAt, tempTableRowCount },
      'Sync completed'
    );

    return {
      maxLastModifiedAt,
      numRecords: tempTableRowCount, // TODO: not quite accurate (because there can be duplicates) but good enough
    };
  }
}

const getObjectTableName = (providerName: ProviderName, object: string, temp?: boolean) => {
  return `${temp ? 'temp_' : ''}${providerName}_${object}`;
};

const getCommonObjectTableName = (category: ProviderCategory, commonObjectType: CommonObjectType) => {
  if (category === 'crm') {
    return tableNamesByCommonObjectType.crm[commonObjectType as CRMCommonObjectType];
  }
  return tableNamesByCommonObjectType.engagement[commonObjectType as EngagementCommonObjectType];
};

const tableNamesByCommonObjectType: {
  crm: Record<CRMCommonObjectType, string>;
  engagement: Record<EngagementCommonObjectType, string>;
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
    contact: keysOfSnakecasedEngagementContactWithTenant,
    sequence_state: keysOfSnakecasedSequenceStateWithTenant,
    user: keysOfSnakecasedEngagementUserWithTenant,
    sequence: keysOfSnakecasedSequenceWithTenant,
    mailbox: keysOfSnakecasedMailboxWithTenant,
  },
};

const getObjectSchema = (temp?: boolean): TableSchema => {
  const schema: TableSchema = {
    fields: [
      {
        name: '_supaglue_application_id',
        type: 'STRING',
        mode: 'REQUIRED',
      },
      {
        name: '_supaglue_provider_name',
        type: 'STRING',
        mode: 'REQUIRED',
      },
      {
        name: '_supaglue_customer_id',
        type: 'STRING',
        mode: 'REQUIRED',
      },
      {
        name: '_supaglue_emitted_at',
        type: 'TIMESTAMP',
        mode: 'REQUIRED',
      },
      {
        name: '_supaglue_is_deleted',
        type: 'BOOLEAN',
        mode: 'REQUIRED',
      },
      {
        name: '_supaglue_raw_data',
        type: 'JSON',
        mode: 'REQUIRED',
      },
      {
        name: 'id',
        type: 'STRING',
        mode: 'REQUIRED',
      },
    ],
  };

  if (temp) {
    schema.fields!.push({
      name: '_supaglue_last_modified_at',
      type: 'TIMESTAMP',
      mode: 'REQUIRED',
    });
  }

  return schema;
};

const getCommonObjectSchema = (category: ProviderCategory, commonObjectType: CommonObjectType) => {
  switch (category) {
    case 'crm':
      return schemaByCommonObjectType.crm[commonObjectType as CRMCommonObjectType];
    case 'engagement':
      return schemaByCommonObjectType.engagement[commonObjectType as EngagementCommonObjectType];
    default:
      throw new Error(`Unknown category: ${category}`);
  }
};

const schemaByCommonObjectType: {
  crm: Record<CRMCommonObjectType, TableSchema>;
  engagement: Record<EngagementCommonObjectType, TableSchema>;
} = {
  crm: {
    account: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'description',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'industry',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'website',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'number_of_employees',
          type: 'INTEGER',
          mode: 'NULLABLE',
        },
        {
          name: 'addresses',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'phone_numbers',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'last_activity_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'lifecycle_stage',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'owner_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
    contact: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'first_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'last_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'addresses',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'email_addresses',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'phone_numbers',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'lifecycle_stage',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'account_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'owner_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'last_activity_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
    lead: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'lead_source',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'title',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'company',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'first_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'last_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'addresses',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'email_addresses',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'phone_numbers',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'converted_date',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'converted_contact_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'converted_account_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'owner_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
    opportunity: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'description',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'amount',
          type: 'INTEGER',
          mode: 'NULLABLE',
        },
        {
          name: 'stage',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'status',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'close_date',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'pipeline',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'account_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'owner_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'last_activity_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
    user: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'email',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'is_active',
          type: 'BOOLEAN',
          mode: 'NULLABLE',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
  },
  engagement: {
    contact: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'first_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'last_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'job_title',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'address',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'email_addresses',
          type: 'JSON',
          mode: 'REQUIRED',
        },
        {
          name: 'phone_numbers',
          type: 'JSON',
          mode: 'REQUIRED',
        },
        {
          name: 'owner_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'open_count',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'click_count',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'reply_count',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'bounced_count',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
    mailbox: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'email',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'user_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
    sequence: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'owner_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'tags',
          type: 'JSON',
          mode: 'NULLABLE',
        },
        {
          name: 'num_steps',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'schedule_count',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'click_count',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'reply_count',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'open_count',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'opt_out_count',
          type: 'INTEGER',
          mode: 'REQUIRED',
        },
        {
          name: 'is_enabled',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
    sequence_state: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'sequence_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'contact_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'mailbox_id',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'state',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
    user: {
      fields: [
        {
          name: '_supaglue_application_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_provider_name',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_customer_id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: '_supaglue_emitted_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'id',
          type: 'STRING',
          mode: 'REQUIRED',
        },
        {
          name: 'created_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'updated_at',
          type: 'TIMESTAMP',
          mode: 'NULLABLE',
        },
        {
          name: 'is_deleted',
          type: 'BOOLEAN',
          mode: 'REQUIRED',
        },
        {
          name: 'last_modified_at',
          type: 'TIMESTAMP',
          mode: 'REQUIRED',
        },
        {
          name: 'first_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'last_name',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'email',
          type: 'STRING',
          mode: 'NULLABLE',
        },
        {
          name: 'raw_data',
          type: 'JSON',
          mode: 'NULLABLE',
        },
      ],
    },
  },
};
