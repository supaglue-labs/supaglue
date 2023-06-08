import { DeleteObjectsCommand, paginateListObjectsV2, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import {
  CommonModelType,
  CommonModelTypeForCategory,
  CommonModelTypeMapForCategory,
  ConnectionSafeAny,
  ProviderCategory,
  ProviderName,
  S3Destination,
} from '@supaglue/types';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';
import { BaseDestinationWriter, WriteCommonModelsResult } from './base';
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

  public override async upsertCommonModelObject<P extends ProviderCategory, T extends CommonModelTypeForCategory<P>>(
    connection: ConnectionSafeAny,
    commonModelType: T,
    object: CommonModelTypeMapForCategory<P>['object']
  ): Promise<void> {
    // Do nothing
    return;
  }

  public override async writeCommonModelObjects(
    connection: ConnectionSafeAny,
    commonModelType: CommonModelType,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelsResult> {
    await this.dropExistingRecordsIfNecessary(
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
            const { object, emittedAt } = chunk;
            const mappedRecord = {
              _supaglue_application_id: applicationId,
              _supaglue_provider_name: providerName,
              _supaglue_customer_id: customerId,
              _supaglue_emitted_at: emittedAt,
              ...mapper(object),
            };
            data.push(mappedRecord);

            // Update the max lastModifiedAt
            const { lastModifiedAt } = object;
            if (lastModifiedAt && (!maxLastModifiedAt || lastModifiedAt > maxLastModifiedAt)) {
              maxLastModifiedAt = lastModifiedAt;
            }

            if (data.length === CHUNK_SIZE) {
              await this.write(commonModelType, connection, data);
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
      await this.write(commonModelType, connection, data);
      heartbeat();
    }

    return { numRecords, maxLastModifiedAt };
  }

  getKeyPrefix(
    applicationId: string,
    category: ProviderCategory,
    commonModelType: CommonModelType,
    customerId: string,
    providerName: ProviderName
  ) {
    return `${applicationId}/${category}/${commonModelType}/${customerId}/${providerName}`;
  }

  async write(
    commonModelType: CommonModelType,
    { providerName, customerId, category, applicationId }: ConnectionSafeAny,
    results: Record<string, any>[]
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
        Key: `${this.getKeyPrefix(applicationId, category, commonModelType, customerId, providerName)}/${Date.now()}`,
        Body: ndjson,
      });

      await this.#client.send(command);
    }
  }

  async dropExistingRecordsIfNecessary(
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
        Prefix: this.getKeyPrefix(applicationId, category, commonModelType, customerId, providerName),
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
