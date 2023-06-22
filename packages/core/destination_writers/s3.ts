import { DeleteObjectsCommand, paginateListObjectsV2, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  CommonModelType,
  CommonModelTypeForCategory,
  CommonModelTypeMapForCategory,
  ConnectionSafeAny,
  NormalizedRawRecord,
  ProviderCategory,
  ProviderName,
  S3Destination,
} from '@supaglue/types';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { BaseDestinationWriter, WriteCommonModelRecordsResult, WriteRawRecordsResult } from './base';
import { getSnakecasedKeysMapper } from './util';

const CHUNK_SIZE = 1000;

export class S3DestinationWriter extends BaseDestinationWriter {
  readonly #destination: S3Destination;
  #client: S3Client;

  public constructor(destination: S3Destination) {
    super();
    this.#destination = destination;
    this.#client = new S3Client({
      credentials: {
        accessKeyId: destination.config.accessKeyId,
        secretAccessKey: destination.config.secretAccessKey,
      },
      region: destination.config.region,
    });
  }

  public override async upsertCommonModelRecord<P extends ProviderCategory, T extends CommonModelTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonModelType: T,
    object: CommonModelTypeMapForCategory<P>['object']
  ): Promise<void> {
    // Do nothing
    return;
  }

  public override async writeCommonModelRecords(
    connection: ConnectionSafeAny,
    commonModelType: CommonModelType,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelRecordsResult> {
    await this.dropExistingCommonModelRecordsIfNecessary(
      connection.applicationId,
      connection.category,
      commonModelType,
      connection.customerId,
      connection.providerName
    );
    const { providerName, customerId, category, applicationId } = connection;
    let numRecords = 0;
    let maxLastModifiedAt: Date | null = null;
    let data: Record<string, any>[] = [];
    const mapper = getSnakecasedKeysMapper(category, commonModelType);
    await pipeline(
      inputStream,
      new Transform({
        objectMode: true,
        transform: async (chunk, encoding, callback) => {
          try {
            numRecords++;
            const { record, emittedAt } = chunk;
            const mappedRecord = {
              _supaglue_application_id: applicationId,
              _supaglue_provider_name: providerName,
              _supaglue_customer_id: customerId,
              _supaglue_emitted_at: emittedAt,
              ...mapper(record),
            };
            data.push(mappedRecord);

            // Update the max lastModifiedAt
            const { lastModifiedAt } = record;
            if (lastModifiedAt && (!maxLastModifiedAt || lastModifiedAt > maxLastModifiedAt)) {
              maxLastModifiedAt = lastModifiedAt;
            }

            if (data.length === CHUNK_SIZE) {
              await this.writeCommonModelRecord(commonModelType, connection, data);
              heartbeat();
              data = [];
            }
            callback();
          } catch (e: any) {
            return callback(e);
          }
        },
      })
    );

    // Write any remaining data
    if (data.length) {
      await this.writeCommonModelRecord(commonModelType, connection, data);
      heartbeat();
    }

    return { numRecords, maxLastModifiedAt };
  }

  getCommonModelKeyPrefix(
    applicationId: string,
    category: ProviderCategory,
    commonModelType: CommonModelType,
    customerId: string,
    providerName: ProviderName
  ) {
    return `${applicationId}/${category}/${commonModelType}/${customerId}/${providerName}`;
  }

  async writeCommonModelRecord(
    commonModelType: CommonModelType,
    { providerName, customerId, category, applicationId }: ConnectionSafeAny,
    results: Record<string, any>[] // TODO: type this
  ): Promise<void> {
    if (results.length) {
      const ndjson = results
        .map((result) =>
          JSON.stringify({
            ...result,
            _supaglue_application_id: applicationId,
            _supaglue_customer_id: customerId,
            _supaglue_provider_name: providerName,
          })
        )
        .join('\n');

      const command = new PutObjectCommand({
        Bucket: this.#destination.config.bucket,
        Key: `${this.getCommonModelKeyPrefix(
          applicationId,
          category,
          commonModelType,
          customerId,
          providerName
        )}/${Date.now()}`,
        Body: ndjson,
      });

      await this.#client.send(command);
    }
  }

  async dropExistingCommonModelRecordsIfNecessary(
    applicationId: string,
    category: ProviderCategory,
    commonModelType: CommonModelType,
    customerId: string,
    providerName: ProviderName
  ) {
    const paginator = paginateListObjectsV2(
      {
        client: this.#client,
        pageSize: 1000,
      },
      {
        Bucket: this.#destination.config.bucket,
        Prefix: this.getCommonModelKeyPrefix(applicationId, category, commonModelType, customerId, providerName),
      }
    );

    for await (const page of paginator) {
      const keys = page.Contents?.flatMap((content) => content.Key ?? []) ?? [];
      if (!keys.length) {
        continue;
      }
      const command = new DeleteObjectsCommand({
        Bucket: this.#destination.config.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      });
      await this.#client.send(command);
    }
  }

  public override async writeObjectRecords(
    connection: ConnectionSafeAny,
    object: string,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteRawRecordsResult> {
    await this.dropExistingRawRecordsIfNecessary(
      connection.applicationId,
      object,
      connection.customerId,
      connection.providerName
    );
    const { providerName, customerId, applicationId } = connection;
    let numRecords = 0;
    let maxLastModifiedAt: Date | null = null;
    let data: Record<string, unknown>[] = [];
    await pipeline(
      inputStream,
      new Transform({
        objectMode: true,
        transform: async (record: NormalizedRawRecord, encoding, callback) => {
          try {
            numRecords++;
            const mappedRecord = {
              _supaglue_application_id: applicationId,
              _supaglue_provider_name: providerName,
              _supaglue_customer_id: customerId,
              _supaglue_emitted_at: record.emittedAt,
              _supaglue_is_deleted: record.isDeleted,
              _supaglue_raw_data: record.rawData,
              id: record.id,
            };
            data.push(mappedRecord);

            // Update the max lastModifiedAt
            const { lastModifiedAt } = record;
            if (lastModifiedAt && (!maxLastModifiedAt || lastModifiedAt > maxLastModifiedAt)) {
              maxLastModifiedAt = lastModifiedAt;
            }

            if (data.length === CHUNK_SIZE) {
              await this.writeRawRecord(object, connection, data);
              heartbeat();
              data = [];
            }
            callback();
          } catch (e: any) {
            return callback(e);
          }
        },
      })
    );

    // Write any remaining data
    if (data.length) {
      await this.writeRawRecord(object, connection, data);
      heartbeat();
    }

    return { numRecords, maxLastModifiedAt };
  }

  getRawRecordKeyPrefix(applicationId: string, object: string, customerId: string, providerName: ProviderName) {
    return `${applicationId}/${providerName}/${object}/${customerId}`;
  }

  async writeRawRecord(
    object: string,
    { providerName, customerId, applicationId }: ConnectionSafeAny,
    results: Record<string, any>[] // TODO: type this
  ): Promise<void> {
    if (results.length) {
      const ndjson = results.map((result) => JSON.stringify(result)).join('\n');

      const command = new PutObjectCommand({
        Bucket: this.#destination.config.bucket,
        Key: `${this.getRawRecordKeyPrefix(applicationId, object, customerId, providerName)}/${Date.now()}`,
        Body: ndjson,
      });

      await this.#client.send(command);
    }
  }

  async dropExistingRawRecordsIfNecessary(
    applicationId: string,
    object: string,
    customerId: string,
    providerName: ProviderName
  ) {
    const paginator = paginateListObjectsV2(
      {
        client: this.#client,
        pageSize: 1000,
      },
      {
        Bucket: this.#destination.config.bucket,
        Prefix: this.getRawRecordKeyPrefix(applicationId, object, customerId, providerName),
      }
    );

    for await (const page of paginator) {
      const keys = page.Contents?.flatMap((content) => content.Key ?? []) ?? [];
      if (!keys.length) {
        continue;
      }
      const command = new DeleteObjectsCommand({
        Bucket: this.#destination.config.bucket,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      });
      await this.#client.send(command);
    }
  }
}
