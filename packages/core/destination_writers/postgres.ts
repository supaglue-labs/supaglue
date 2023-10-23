import type {
  BaseFullRecord,
  CommonObjectType,
  CommonObjectTypeForCategory,
  CommonObjectTypeMapForCategory,
  ConnectionSafeAny,
  ConnectionSyncConfig,
  DestinationUnsafe,
  FullEntityRecord,
  FullObjectRecord,
  ProviderCategory,
  ProviderName,
} from '@supaglue/types';
import type { CRMCommonObjectType } from '@supaglue/types/crm';
import type { EngagementCommonObjectType } from '@supaglue/types/engagement';
import { slugifyForTableName } from '@supaglue/utils';
import type { PoolClient } from 'pg';
import { Pool } from 'pg';
import type { pino } from 'pino';
import type { Readable } from 'stream';
import { getCommonObjectSchemaSetupSql, getSsl, logger } from '../lib';
import type { WriteCommonObjectRecordsResult, WriteEntityRecordsResult, WriteObjectRecordsResult } from './base';
import { BaseDestinationWriter } from './base';
import { PostgresDestinationWriterImpl } from './postgres_impl';

export class PostgresDestinationWriter extends BaseDestinationWriter {
  readonly #destination: DestinationUnsafe<'postgres'>;
  #writerImpl: PostgresDestinationWriterImpl;

  public constructor(destination: DestinationUnsafe<'postgres'>) {
    super();
    this.#destination = destination;
    this.#writerImpl = new PostgresDestinationWriterImpl();
  }

  async #getClient(): Promise<PoolClient> {
    const { sslMode, ...rest } = this.#destination.config;
    const pool = new Pool({
      ...rest,
      max: 20,
      statement_timeout: 60 * 60 * 1000, // 1 hour - assuming that COPY FROM STDIN is subject to this timeout
      ssl: getSsl(sslMode),
    });
    return await pool.connect();
  }

  #getSchema(connectionSyncConfig?: ConnectionSyncConfig): string {
    return connectionSyncConfig?.destinationConfig?.type === 'postgres'
      ? connectionSyncConfig.destinationConfig.schema
      : this.#destination.config.schema;
  }

  protected async upsertCommonObjectRecordImpl<P extends ProviderCategory, T extends CommonObjectTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonObjectType: T,
    record: CommonObjectTypeMapForCategory<P>['object'],
    schema: string,
    table: string
  ): Promise<void> {
    const { providerName, category } = connection;
    if (category === 'no_category' || !commonObjectType) {
      throw new Error(`Common objects not supported for provider: ${providerName}`);
    }

    const client = await this.#getClient();

    return await this.#writerImpl.upsertCommonObjectRecordImpl(
      client,
      connection,
      commonObjectType,
      record,
      schema,
      table,
      async () => await this.#setupCommonObjectTable(client, schema, table, category, commonObjectType)
    );
  }

  public override async upsertCommonObjectRecord<P extends ProviderCategory, T extends CommonObjectTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonObjectType: T,
    record: CommonObjectTypeMapForCategory<P>['object']
  ): Promise<void> {
    const { providerName, category, connectionSyncConfig } = connection;
    if (category === 'no_category' || !commonObjectType) {
      throw new Error(`Common objects not supported for provider: ${providerName}`);
    }
    const schema = this.#getSchema(connectionSyncConfig);
    const table = getCommonObjectTableName(category, commonObjectType);
    const client = await this.#getClient();
    return await this.#writerImpl.upsertCommonObjectRecordImpl(
      client,
      connection,
      commonObjectType,
      record,
      schema,
      table,
      async () => this.#setupCommonObjectTable(client, schema, table, category, commonObjectType)
    );
  }

  async #setupCommonObjectTable(
    client: PoolClient,
    schema: string,
    table: string,
    category: ProviderCategory,
    commonObjectType: CommonObjectType,
    alsoCreateTempTable = false
  ) {
    // Create tables if necessary
    // TODO: We should only need to do this once at the beginning
    await client.query(getCommonObjectSchemaSetupSql(category, commonObjectType)(schema));

    if (alsoCreateTempTable) {
      const tempTable = `temp_${table}`;
      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      await client.query(getCommonObjectSchemaSetupSql(category, commonObjectType)(schema, /* temp */ true));
      await client.query(`CREATE INDEX IF NOT EXISTS pk_idx ON ${tempTable} (id ASC, last_modified_at DESC)`);
    }
  }

  public override async writeCommonObjectRecords(
    connection: ConnectionSafeAny,
    commonObjectType: CommonObjectType,
    inputStream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteCommonObjectRecordsResult> {
    const { category, connectionSyncConfig } = connection;
    const schema = this.#getSchema(connectionSyncConfig);
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

  public override async writeEntityRecords(
    connection: ConnectionSafeAny,
    entityName: string,
    inputStream: Readable,
    heartbeat: () => void,
    diffAndDeleteRecords: boolean
  ): Promise<WriteEntityRecordsResult> {
    const { id: connectionId, providerName, customerId } = connection;
    return await this.#writeRecords(
      connection,
      getEntityTableName(entityName),
      inputStream,
      heartbeat,
      logger.child({ connectionId, providerName, customerId, entityName }),
      diffAndDeleteRecords
    );
  }

  public override async upsertEntityRecord(
    connection: ConnectionSafeAny,
    entityName: string,
    record: FullEntityRecord
  ): Promise<void> {
    return await this.#upsertRecord(connection, getEntityTableName(entityName), record);
  }

  async #setupObjectOrEntityTable(
    client: PoolClient,
    table: string,
    schema: string,
    alsoCreateTempTable = false
  ): Promise<void> {
    // Create tables if necessary
    // TODO: We should only need to do this once at the beginning
    await client.query(getObjectOrEntitySchemaSetupSql(table, schema));
    if (alsoCreateTempTable) {
      const tempTable = `"temp_${table}"`;
      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper so that we can resume in the case of failure during the COPY stage.
      await client.query(`DROP TABLE IF EXISTS ${tempTable}`);
      await client.query(getObjectOrEntitySchemaSetupSql(table, schema, /* temp */ true));
      await client.query(
        `CREATE INDEX IF NOT EXISTS pk_idx ON ${tempTable} (_supaglue_id ASC, _supaglue_last_modified_at DESC)`
      );
    }
  }

  async #upsertRecord(connection: ConnectionSafeAny, table: string, record: BaseFullRecord): Promise<void> {
    const schema = this.#getSchema(connection.connectionSyncConfig);
    const client = await this.#getClient();
    await this.#writerImpl.upsertRecordImpl(
      client,
      connection,
      schema,
      table,
      record,
      async () => await this.#setupObjectOrEntityTable(client, table, schema)
    );
  }

  async #writeRecords(
    connection: ConnectionSafeAny,
    table: string,
    inputStream: Readable,
    heartbeat: () => void,
    childLogger: pino.Logger,
    diffAndDeleteRecords: boolean
  ): Promise<WriteObjectRecordsResult> {
    const schema = this.#getSchema(connection.connectionSyncConfig);
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
        await this.#setupObjectOrEntityTable(client, table, schema, /* alsoCreateTempTable */ true);
      }
    );
  }
}

const getObjectTableName = (providerName: ProviderName, object: string) => {
  const cleanObjectName = slugifyForTableName(object);
  return `${providerName}_${cleanObjectName}`;
};

const getEntityTableName = (entityName: string) => {
  const cleanEntityName = slugifyForTableName(entityName);
  return `entity_${cleanEntityName}`;
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
    account: 'engagement_accounts',
    contact: 'engagement_contacts',
    sequence_state: 'engagement_sequence_states',
    sequence_step: 'engagement_sequence_steps',
    user: 'engagement_users',
    sequence: 'engagement_sequences',
    mailbox: 'engagement_mailboxes',
  },
};

const getObjectOrEntitySchemaSetupSql = (baseTableName: string, schema: string, temp?: boolean) => {
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
);`;
};
