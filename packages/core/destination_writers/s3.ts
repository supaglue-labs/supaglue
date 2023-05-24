import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { CommonModel, ConnectionSafeAny, IntegrationCategory, ProviderName, S3Destination } from '@supaglue/types';
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

  public override async writeObjects(
    connection: ConnectionSafeAny,
    commonModelType: CommonModel,
    inputStream: Readable,
    heartbeat: () => void
  ): Promise<WriteCommonModelsResult> {
    const { providerName, customerId, category } = connection;
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
            const mappedRecord = {
              provider_name: providerName,
              customer_id: customerId,
              ...mapper(chunk),
            };
            data.push(mappedRecord);

            // Update the max lastModifiedAt
            const { lastModifiedAt } = chunk;
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
    category: IntegrationCategory,
    commonModelType: CommonModel,
    customerId: string,
    providerName: ProviderName
  ) {
    return `${category}/${commonModelType}/${customerId}/${providerName}`;
  }

  async write(
    commonModelType: CommonModel,
    { providerName, customerId, category }: ConnectionSafeAny,
    results: Record<string, any>[]
  ): Promise<void> {
    if (results.length) {
      const ndjson = results
        .map((result) =>
          JSON.stringify({
            ...result,
            customer_id: customerId,
            provider_name: providerName,
          })
        )
        .join('\n');

      const command = new PutObjectCommand({
        Bucket: this.#destination.config.bucket,
        Key: `${this.getKeyPrefix(category, commonModelType, customerId, providerName)}/${Date.now()}`,
        Body: ndjson,
      });

      await this.#client.send(command);
    }
  }
}
