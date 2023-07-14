import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { BigQuery } from '@google-cloud/bigquery';
import type { PrismaClient } from '@supaglue/db';
import type {
  DestinationConfigUnsafeAny,
  DestinationCreateParamsAny,
  DestinationSafeAny,
  DestinationTestParamsAny,
  DestinationTestResult,
  DestinationUnsafe,
  DestinationUnsafeAny,
  DestinationUpdateParamsAny,
} from '@supaglue/types';
import { Client } from 'pg';
import type { DestinationWriter } from '../destination_writers/base';
import { BigQueryDestinationWriter } from '../destination_writers/bigquery';
import { PostgresDestinationWriter } from '../destination_writers/postgres';
import { S3DestinationWriter } from '../destination_writers/s3';
import { BadRequestError } from '../errors';
import { fromDestinationModelToSafe, fromDestinationModelToUnsafe } from '../mappers/destination';

export class DestinationService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getDestinationsSafeByApplicationId(applicationId: string): Promise<DestinationSafeAny[]> {
    const models = await this.#prisma.destination.findMany({
      where: { applicationId },
    });
    return models.map(fromDestinationModelToSafe);
  }

  public async getDestinationUnsafeByProviderId(providerId: string): Promise<DestinationUnsafeAny | null> {
    const model = await this.#prisma.destination.findFirst({
      where: {
        syncConfigs: {
          some: {
            providerId,
          },
        },
      },
    });
    if (!model) {
      return null;
    }
    return fromDestinationModelToUnsafe(model);
  }

  public async getDestinationSafeById(id: string): Promise<DestinationSafeAny> {
    const model = await this.#prisma.destination.findUniqueOrThrow({
      where: { id },
    });
    return fromDestinationModelToSafe(model);
  }

  public async getDestinationUnsafeById(id: string): Promise<DestinationUnsafeAny> {
    const model = await this.#prisma.destination.findUniqueOrThrow({
      where: { id },
    });
    return fromDestinationModelToUnsafe(model);
  }

  public async createDestination(params: DestinationCreateParamsAny): Promise<DestinationSafeAny> {
    if (!params.name) {
      throw new BadRequestError('name is required');
    }
    const model = await this.#prisma.destination.create({
      data: {
        name: params.name,
        applicationId: params.applicationId,
        type: params.type,
        config: params.config,
      },
    });
    return fromDestinationModelToSafe(model);
  }

  public async testDestination(params: DestinationTestParamsAny): Promise<DestinationTestResult> {
    let success = false;
    let message: string | null = null;

    if (!('id' in params)) {
      const nameAlreadyExists = await this.#prisma.destination.findUnique({
        where: {
          applicationId_name: {
            applicationId: params.applicationId,
            name: params.name,
          },
        },
      });
      if (nameAlreadyExists) {
        return {
          success,
          message: 'Destination with name already exists',
        };
      }
    }

    // TODO: Refactor this code to be cleaner to merge in credentials

    const existingDestination = 'id' in params ? await this.getDestinationUnsafeById(params.id) : null;

    switch (params.type) {
      case 's3':
        try {
          const s3Client = new S3Client({
            credentials: {
              accessKeyId: params.config.accessKeyId,
              secretAccessKey:
                params.config.secretAccessKey ??
                (existingDestination as DestinationUnsafe<'s3'> | null)?.config.secretAccessKey ??
                '', // TODO: shouldn't do empty string
            },
            region: params.config.region,
            requestHandler: new NodeHttpHandler({
              connectionTimeout: 1500,
            }),
          });
          const command = new ListBucketsCommand({}); // Use listing as a proxy for appropriate credentials
          const result = await s3Client.send(command);
          s3Client.destroy();
          if (result.$metadata.httpStatusCode === 200) {
            success = true;
          }
        } catch (err: any) {
          ({ message } = err);
        }
        break;
      case 'postgres':
        {
          try {
            const pgClient = new Client({
              ...params.config,
              password:
                params.config.password ??
                (existingDestination as DestinationUnsafe<'postgres'> | null)?.config.password,
              connectionTimeoutMillis: 1500,
              statement_timeout: 1500,
            });
            await pgClient.connect();

            const schemaResult = await pgClient.query(
              `SELECT schema_name FROM information_schema.schemata WHERE schema_name = '${params.config.schema}'`
            ); // Use existence of schema as a proxy for appropriate grants

            await pgClient.end();

            if (schemaResult.rowCount === 0) {
              message = 'schema does not exist';
            } else {
              success = true;
            }
          } catch (err: any) {
            ({ message } = err);
          }
        }
        break;
      case 'bigquery':
        {
          try {
            const bigQueryClient = new BigQuery({
              ...params.config,
              credentials: {
                client_email: params.config.credentials.clientEmail,
                private_key:
                  params.config.credentials.privateKey ??
                  (existingDestination as DestinationUnsafe<'bigquery'> | null)?.config.credentials.privateKey ??
                  '', // TODO: shouldn't do empty string
              },
              autoRetry: false,
            });
            const [datasets] = await bigQueryClient.getDatasets();

            // if we can't find params.config.dataset in the list of datasets, it doesn't exist
            const datasetExists = datasets.some((dataset) => dataset?.id === params.config.dataset);
            if (!datasetExists) {
              message = 'dataset does not exist';
            } else {
              success = true;
            }
          } catch (err: any) {
            ({ message } = err);
          }
        }
        break;
      default:
        throw new BadRequestError(`unknown destination type`);
    }
    return { success, message };
  }

  public async updateDestination(params: DestinationUpdateParamsAny): Promise<DestinationSafeAny> {
    if (!params.name) {
      throw new BadRequestError('name is required');
    }
    const existingDestination = await this.getDestinationUnsafeById(params.id);
    const model = await this.#prisma.destination.update({
      where: { id: params.id },
      data: {
        applicationId: params.applicationId,
        type: params.type,
        config: params.config,
        name: params.name,
      },
    });
    return fromDestinationModelToSafe(model);
  }

  public async getWriterByProviderId(providerId: string): Promise<DestinationWriter | null> {
    const destination = await this.getDestinationUnsafeByProviderId(providerId);
    if (!destination) {
      return null;
    }
    switch (destination.type) {
      case 's3':
        return new S3DestinationWriter(destination);
      case 'postgres':
        return new PostgresDestinationWriter(destination);
      case 'bigquery':
        return new BigQueryDestinationWriter(destination);
    }
  }

  public async getWriterByDestinationId(destinationId: string): Promise<DestinationWriter | null> {
    const destination = await this.getDestinationUnsafeById(destinationId);
    if (!destination) {
      return null;
    }
    switch (destination.type) {
      case 's3':
        return new S3DestinationWriter(destination);
      case 'postgres':
        return new PostgresDestinationWriter(destination);
      case 'bigquery':
        return new BigQueryDestinationWriter(destination);
    }
  }
}

function mergeDestinationConfig(
  existingConfig: DestinationConfigUnsafeAny,
  params: DestinationUpdateParamsAny
): DestinationConfigUnsafeAny {
  // TODO: merge them
}
