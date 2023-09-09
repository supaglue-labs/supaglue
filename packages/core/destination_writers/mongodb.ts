import type {
  BaseFullRecord,
  CommonObjectType,
  CommonObjectTypeForCategory,
  CommonObjectTypeMapForCategory,
  ConnectionSafeAny,
  DestinationUnsafe,
  FullEntityRecord,
  MappedListedObjectRecord,
  ProviderCategory,
  ProviderName,
  StandardFullObjectRecord,
} from '@supaglue/types';
import type { CRMCommonObjectType } from '@supaglue/types/crm';
import type { EngagementCommonObjectType } from '@supaglue/types/engagement';
import fs from 'fs';
import type { Collection } from 'mongodb';
import { MongoClient, ServerApiVersion } from 'mongodb';
import path from 'path';
import type { pino } from 'pino';
import type { Readable } from 'stream';
import { Transform, Writable } from 'stream';
import { pipeline } from 'stream/promises';
import { CacheInvalidationError } from '../errors';
import { logger } from '../lib';
import type { WriteCommonObjectRecordsResult, WriteEntityRecordsResult, WriteObjectRecordsResult } from './base';
import { BaseDestinationWriter, toTransformedPropertiesWithAdditionalFields } from './base';
import { getSnakecasedKeysMapper } from './util';

const BATCH_SIZE = 1000;
const { version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));

export class MongoDBDestinationWriter extends BaseDestinationWriter {
  readonly #destination: DestinationUnsafe<'mongodb'>;

  public constructor(destination: DestinationUnsafe<'mongodb'>) {
    super();
    this.#destination = destination;
  }

  #getClient(): MongoClient {
    const { config } = this.#destination;
    // TODO also support non-Atlas MongoDB connections, multiple hosts, X.509 auth, etc.
    const uri = `mongodb+srv://${config.user}:${encodeURIComponent(config.password)}@${config.host}`;
    return new MongoClient(uri, {
      appName: `supaglue-${version}`,
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
  }

  public override async upsertCommonObjectRecord<P extends ProviderCategory, T extends CommonObjectTypeForCategory<P>>(
    { providerName, customerId, category, applicationId }: ConnectionSafeAny,
    commonObjectType: T,
    record: CommonObjectTypeMapForCategory<P>['object']
  ): Promise<void> {
    if (category === 'no_category' || !commonObjectType) {
      throw new Error(`Common objects not supported for provider: ${providerName}`);
    }
    const mapper = getSnakecasedKeysMapper(category, commonObjectType);

    const mappedRecord = {
      _supaglue_application_id: applicationId,
      _supaglue_provider_name: providerName,
      _supaglue_customer_id: customerId,
      _supaglue_emitted_at: new Date(),
      ...mapper(record),
    };
    const { database } = this.#destination.config;
    const collectionName = getCommonObjectCollectionName(category, commonObjectType);

    const client = this.#getClient();
    const childLogger = logger.child({ providerName, customerId, commonObjectType });
    try {
      const collection = client.db(database).collection(collectionName);

      await collection.replaceOne(
        {
          id: mappedRecord.id,
          _supaglue_application_id: mappedRecord._supaglue_application_id,
          _supaglue_provider_name: mappedRecord._supaglue_provider_name,
          _supaglue_customer_id: mappedRecord._supaglue_customer_id,
        },
        mappedRecord,
        { upsert: true }
      );
    } catch (err) {
      childLogger.error({ err }, 'Error upserting common object record');
      throw new CacheInvalidationError('Cache invalidation error for common object record on MongoDB');
    }
  }

  public override async writeCommonObjectRecords(
    { id: connectionId, providerName, customerId, category, applicationId }: ConnectionSafeAny,
    commonObjectType: CommonObjectType,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonObjectRecordsResult> {
    const childLogger = logger.child({ connectionId, providerName, customerId, commonObjectType });

    const { database } = this.#destination.config;
    const collectionName = getCommonObjectCollectionName(category, commonObjectType);

    const client = this.#getClient();
    const collection = client.db(database).collection(collectionName);
    await collection.createIndex(
      {
        _supaglue_application_id: 1,
        _supaglue_customer_id: 1,
        _supaglue_provider_name: 1,
        id: 1,
      },
      { unique: true }
    );

    // Output
    const stream = streamToMongoDBCollection(collection, client, heartbeat);
    stream.on('error', (error) => {
      childLogger.error(error, 'Error writing to MongoDB');
    });

    const mapper = getSnakecasedKeysMapper(category, commonObjectType);

    // Keep track of stuff
    let rowCount = 0;
    let maxLastModifiedAt: Date | null = null;

    childLogger.info({ collectionName }, 'Importing common object records into collection [IN PROGRESS]');
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
              id: record.id,
              ...mapper(record),
            };

            ++rowCount;

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
      stream
    );
    childLogger.info({ collectionName }, 'Importing common object records into collection [COMPLETED]');

    childLogger.info(
      { collectionName, providerName, customerId, commonObjectType, maxLastModifiedAt, rowCount },
      'Sync completed'
    );

    return {
      maxLastModifiedAt,
      numRecords: rowCount,
    };
  }

  public override async writeObjectRecords(
    connection: ConnectionSafeAny,
    object: string,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteObjectRecordsResult> {
    const { id: connectionId, providerName, customerId } = connection;
    return await this.#writeRecords(
      connection,
      getObjectCollectionName(connection.providerName, object),
      inputStream,
      heartbeat,
      logger.child({ connectionId, providerName, customerId, object })
    );
  }

  public override async upsertStandardObjectRecord(
    connection: ConnectionSafeAny,
    objectName: string,
    record: StandardFullObjectRecord
  ): Promise<void> {
    return await this.#upsertRecord(connection, getObjectCollectionName(connection.providerName, objectName), record);
  }

  public override async writeEntityRecords(
    connection: ConnectionSafeAny,
    entityName: string,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteEntityRecordsResult> {
    const { id: connectionId, providerName, customerId } = connection;
    return await this.#writeRecords(
      connection,
      getEntityCollectionName(entityName),
      inputStream,
      heartbeat,
      logger.child({ connectionId, providerName, customerId, entityName })
    );
  }

  public override async upsertEntityRecord(
    connection: ConnectionSafeAny,
    entityName: string,
    record: FullEntityRecord
  ): Promise<void> {
    return await this.#upsertRecord(connection, getEntityCollectionName(entityName), record);
  }

  async #upsertRecord(
    { applicationId, providerName, customerId }: ConnectionSafeAny,
    collectionName: string,
    record: BaseFullRecord
  ): Promise<void> {
    const { additionalFields, ...otherMappedProperties } = record.mappedProperties;

    const mappedRecord = {
      _supaglue_application_id: applicationId,
      _supaglue_provider_name: providerName,
      _supaglue_customer_id: customerId,
      _supaglue_id: record.id,
      _supaglue_emitted_at: new Date(),
      _supaglue_last_modified_at: record.metadata.lastModifiedAt,
      _supaglue_is_deleted: record.metadata.isDeleted,
      _supaglue_raw_data: record.rawData,
      _supaglue_mapped_data: toTransformedPropertiesWithAdditionalFields(record.mappedProperties),
      ...otherMappedProperties,
      _supaglue_additional_fields: additionalFields,
    };
    const { database } = this.#destination.config;

    const client = this.#getClient();
    const childLogger = logger.child({ providerName, customerId });

    try {
      const collection = client.db(database).collection(collectionName);

      await collection.replaceOne(
        {
          _supaglue_application_id: mappedRecord._supaglue_application_id,
          _supaglue_provider_name: mappedRecord._supaglue_provider_name,
          _supaglue_customer_id: mappedRecord._supaglue_customer_id,
          _supaglue_id: mappedRecord._supaglue_id,
        },
        mappedRecord,
        { upsert: true }
      );
    } catch (err) {
      childLogger.error({ err }, 'Error upserting common object record');
      throw new CacheInvalidationError('Cache invalidation error for object record on MongoDB');
    }
  }

  async #writeRecords(
    { providerName, customerId, applicationId }: ConnectionSafeAny,
    collectionName: string,
    inputStream: Readable,
    heartbeat: () => void,
    childLogger: pino.Logger
  ): Promise<WriteObjectRecordsResult> {
    const { database } = this.#destination.config;

    const client = this.#getClient();
    const collection = client.db(database).collection(collectionName);
    await collection.createIndex(
      {
        _supaglue_application_id: 1,
        _supaglue_customer_id: 1,
        _supaglue_provider_name: 1,
        _id: 1,
      },
      { unique: true }
    );

    // Output
    const stream = streamToMongoDBCollection(collection, client, heartbeat);
    stream.on('error', (error) => {
      childLogger.error(error, 'Error writing to MongoDB');
    });

    // Keep track of stuff
    let rowCount = 0;
    let maxLastModifiedAt: Date | null = null;

    childLogger.info({ rowCount }, 'Importing raw records into collection [IN PROGRESS]');
    await pipeline(
      inputStream,
      new Transform({
        objectMode: true,
        transform: (record: MappedListedObjectRecord, encoding, callback) => {
          try {
            const { additionalFields, ...otherMappedProperties } = record.mappedProperties;

            const mappedRecord = {
              _supaglue_application_id: applicationId,
              _supaglue_provider_name: providerName,
              _supaglue_customer_id: customerId,
              _supaglue_id: record.id,
              _supaglue_emitted_at: record.emittedAt,
              _supaglue_last_modified_at: record.lastModifiedAt,
              _supaglue_is_deleted: record.isDeleted,
              _supaglue_raw_data: record.rawData,
              _supaglue_mapped_data: toTransformedPropertiesWithAdditionalFields(record.mappedProperties),
              ...otherMappedProperties,
              _supaglue_additional_fields: additionalFields,
            };

            ++rowCount;

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
      stream
    );
    childLogger.info({ collectionName }, 'Importing raw records into collection [COMPLETED]');

    childLogger.info({ collectionName, maxLastModifiedAt, rowCount }, 'Sync completed');

    return {
      maxLastModifiedAt,
      numRecords: rowCount, // TODO: not quite accurate (because there can be duplicates) but good enough
    };
  }
}

const getObjectCollectionName = (providerName: ProviderName, object: string) => {
  return `${providerName}_${object}`;
};

const getEntityCollectionName = (entityName: string) => {
  const cleanEntityName = entityName.replace(/[^a-zA-Z0-9]/g, '');
  return `entity_${cleanEntityName}`;
};

const getCommonObjectCollectionName = (category: ProviderCategory, commonObjectType: CommonObjectType) => {
  if (category === 'crm') {
    return collectionNamesByCommonObjectType.crm[commonObjectType as CRMCommonObjectType];
  }
  return collectionNamesByCommonObjectType.engagement[commonObjectType as EngagementCommonObjectType];
};

const collectionNamesByCommonObjectType: {
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

function streamToMongoDBCollection(collection: Collection, client: MongoClient, heartbeat: () => void) {
  let documents: any[] = [];

  const upsert = async () => {
    await collection.bulkWrite(
      documents.map((document) => ({
        replaceOne: {
          filter: {
            id: document.id ?? document._id,
            _supaglue_application_id: document._supaglue_application_id,
            _supaglue_provider_name: document._supaglue_provider_name,
            _supaglue_customer_id: document._supaglue_customer_id,
          },
          replacement: document,
          upsert: true,
        },
      }))
    );
    documents = [];
    heartbeat();
  };

  const writable = new Writable({
    objectMode: true,
    write: async (document, encoding, next) => {
      try {
        documents.push(document);

        if (documents.length >= BATCH_SIZE) {
          await upsert();
        }

        next();
      } catch (error) {
        writable.emit('error', error);
        await client.close();
        return next(error as Error);
      }
    },
  });

  writable.on('finish', async () => {
    try {
      if (documents.length > 0) {
        await upsert();
      }

      await client.close();
      writable.emit('close');
    } catch (error) {
      writable.emit('error', error);
      await client.close();
    }
  });

  return writable;
}
