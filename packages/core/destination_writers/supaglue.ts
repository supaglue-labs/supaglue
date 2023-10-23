import type {
  CommonObjectType,
  CommonObjectTypeForCategory,
  CommonObjectTypeMapForCategory,
  ConnectionSafeAny,
  FullEntityRecord,
  FullObjectRecord,
  ProviderCategory,
} from '@supaglue/types';
import type { Pool, PoolClient } from 'pg';
import type { pino } from 'pino';
import type { Readable } from 'stream';
import { NotImplementedError } from '../errors';
import {
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
import { PostgresDestinationWriterImpl } from './postgres_impl';

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
  #writerImpl: PostgresDestinationWriterImpl;
  constructor() {
    super();
    this.#writerImpl = new PostgresDestinationWriterImpl();
    this.#pgPool = getPgPool(process.env.SUPAGLUE_MANAGED_DATABASE_URL!);
  }
  async #getClient(): Promise<PoolClient> {
    return await this.#pgPool.connect();
  }

  async #setupCommonObjectTable(
    client: PoolClient,
    schema: string,
    table: string,
    category: ProviderCategory,
    commonObjectType: CommonObjectType,
    customerId: string,
    alsoCreateTempTable = false
  ): Promise<void> {
    // Create tables if necessary
    // TODO: We should only need to do this once at the beginning
    await client.query(getSchemaSetupSql(schema));
    await client.query(
      getCommonObjectSchemaSetupSql(category, commonObjectType)(schema, /* temp */ false, /* partition */ true)
    );
    await createPartitionIfNotExists(client, schema, table, customerId, 'last_modified_at');
    if (alsoCreateTempTable) {
      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      const tempTable = `temp_${table}`;
      await client.query(`DROP TABLE IF EXISTS ${tempTable}`);
      await client.query(
        getCommonObjectSchemaSetupSql(category, commonObjectType)(schema, /* temp */ true, /* partition */ false)
      );
      await client.query(`CREATE INDEX IF NOT EXISTS pk_idx ON ${tempTable} (id ASC, last_modified_at DESC)`);
    }
  }

  public override async upsertCommonObjectRecord<P extends ProviderCategory, T extends CommonObjectTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonObjectType: T,
    record: CommonObjectTypeMapForCategory<P>['object']
  ): Promise<void> {
    const schema = getSchemaName(connection.applicationId);
    const table = getCommonObjectTableName(connection.category, commonObjectType as CommonObjectType);
    const client = await this.#getClient();

    return await this.#writerImpl.upsertCommonObjectRecordImpl(
      client,
      connection,
      commonObjectType,
      record,
      schema,
      table,
      async () => {
        await this.#setupCommonObjectTable(
          client,
          schema,
          table,
          connection.category,
          commonObjectType as CommonObjectType,
          connection.customerId
        );
      }
    );
  }

  public override async writeCommonObjectRecords(
    connection: ConnectionSafeAny,
    commonObjectType: CommonObjectType,
    inputStream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteCommonObjectRecordsResult> {
    const { customerId, category, applicationId } = connection;
    const schema = getSchemaName(applicationId);
    const table = getCommonObjectTableName(category, commonObjectType);

    const client = await this.#getClient();

    return await this.#writerImpl.writeCommonObjectRecordsImpl(
      client,
      connection,
      commonObjectType,
      inputStream,
      heartbeat,
      diffAndDeleteRecords,
      schema,
      table,
      async () => {
        await this.#setupCommonObjectTable(
          client,
          schema,
          table,
          category,
          commonObjectType,
          customerId,
          /* alsoCreateTempTable */ true
        );
      }
    );
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
    record: FullObjectRecord
  ): Promise<void> {
    return await this.#upsertRecord(connection, getObjectTableName(connection.providerName, objectName), record);
  }

  public override async upsertCustomObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    record: FullObjectRecord
  ): Promise<void> {
    return await this.#upsertRecord(connection, getObjectTableName(connection.providerName, objectName), record);
  }

  async #upsertRecord(connection: ConnectionSafeAny, table: string, record: FullObjectRecord): Promise<void> {
    const schema = getSchemaName(connection.applicationId);
    const client = await this.#getClient();

    return await this.#writerImpl.upsertRecordImpl(
      client,
      connection,
      schema,
      table,
      record,
      async () => await this.#setupStandardOrCustomObjectTable(client, schema, table, connection.customerId)
    );
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

  async #setupStandardOrCustomObjectTable(
    client: PoolClient,
    schema: string,
    table: string,
    customerId: string,
    alsoCreateTempTable = false
  ) {
    await client.query(getSchemaSetupSql(schema));
    await client.query(getTableSetupSql(table, schema));
    await createPartitionIfNotExists(client, schema, table, customerId, '_supaglue_last_modified_at');
    if (alsoCreateTempTable) {
      const tempTable = `temp_${table}`;
      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      await client.query(`DROP TABLE IF EXISTS ${tempTable}`);
      await client.query(getTableSetupSql(table, schema, /* temp */ true));
      await client.query(
        `CREATE INDEX IF NOT EXISTS pk_idx ON ${tempTable} (_supaglue_id ASC, _supaglue_last_modified_at DESC)`
      );
    }
  }

  async #writeRecords(
    connection: ConnectionSafeAny,
    table: string,
    inputStream: Readable,
    heartbeat: () => void,
    childLogger: pino.Logger,
    diffAndDeleteRecords: boolean
  ): Promise<WriteObjectRecordsResult> {
    const schema = getSchemaName(connection.applicationId);
    const client = await this.#getClient();

    return await this.#writerImpl.writeRecordsImpl(
      client,
      connection,
      schema,
      table,
      inputStream,
      heartbeat,
      childLogger,
      diffAndDeleteRecords,
      async () => {
        await this.#setupStandardOrCustomObjectTable(
          client,
          schema,
          table,
          connection.customerId,
          /* alsoCreateTempTable */ true
        );
      }
    );
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
  "_supaglue_raw_data" JSONB NOT NULL,
  "_supaglue_mapped_data" JSONB NOT NULL

  ${
    temp
      ? ''
      : ', PRIMARY KEY ("_supaglue_application_id", "_supaglue_provider_name", "_supaglue_customer_id", "_supaglue_id")'
  }
    
)${temp ? ';' : ' PARTITION BY LIST ( _supaglue_customer_id );'}`;
};
