import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { BigQuery } from '@google-cloud/bigquery';
import type { PrismaClient } from '@supaglue/db';
import type {
  Destination,
  DestinationCreateParams,
  DestinationTestParams,
  DestinationTestResult,
  DestinationUpdateParams,
} from '@supaglue/types';
import { snakecaseKeys } from '@supaglue/utils';
import fs from 'fs';
import { MongoClient, ServerApiVersion } from 'mongodb';
import path from 'path';
import { Client } from 'pg';
import type { DestinationWriter } from '../destination_writers/base';
import { BigQueryDestinationWriter } from '../destination_writers/bigquery';
import { MongoDBDestinationWriter } from '../destination_writers/mongodb';
import { PostgresDestinationWriter } from '../destination_writers/postgres';
import { S3DestinationWriter } from '../destination_writers/s3';
import { BadRequestError } from '../errors';
import { fromDestinationModel } from '../mappers/destination';

const { version } = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));

export class DestinationService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getDestinationsByApplicationId(applicationId: string): Promise<Destination[]> {
    const models = await this.#prisma.destination.findMany({
      where: { applicationId },
    });
    return models.map(fromDestinationModel);
  }

  public async getDestinationByProviderId(providerId: string): Promise<Destination | null> {
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
    return fromDestinationModel(model);
  }

  public async getDestinationById(id: string): Promise<Destination> {
    const model = await this.#prisma.destination.findUniqueOrThrow({
      where: { id },
    });
    return fromDestinationModel(model);
  }

  public async createDestination(params: DestinationCreateParams): Promise<Destination> {
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
    return fromDestinationModel(model);
  }

  public async testDestination(params: DestinationTestParams): Promise<DestinationTestResult> {
    let success = false;
    let message: string | null = null;
    if (!params.id) {
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

    switch (params.type) {
      case 's3':
        try {
          const s3Client = new S3Client({
            credentials: {
              accessKeyId: params.config.accessKeyId,
              secretAccessKey: params.config.secretAccessKey,
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
              credentials: snakecaseKeys(params.config.credentials),
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
      case 'mongodb':
        {
          const { config } = params;
          const uri = `mongodb+srv://${config.user}:${encodeURIComponent(config.password)}@${config.host}`;
          // TODO also support non-Atlas MongoDB connections, multiple hosts, X.509 auth, etc.
          const mongoClient = new MongoClient(uri, {
            appName: `supaglue-${version}`,
            serverApi: {
              version: ServerApiVersion.v1,
              strict: true,
              deprecationErrors: true,
            },
          });
          try {
            await mongoClient.db('admin').command({ ping: 1 });
            success = true;
          } catch (err: any) {
            ({ message } = err);
          } finally {
            await mongoClient.close();
          }
        }
        break;
      default:
        throw new BadRequestError(`unknown destination type`);
    }
    return { success, message };
  }

  public async updateDestination(params: DestinationUpdateParams): Promise<Destination> {
    if (!params.name) {
      throw new BadRequestError('name is required');
    }
    const model = await this.#prisma.destination.update({
      where: { id: params.id },
      data: {
        applicationId: params.applicationId,
        type: params.type,
        config: params.config,
        name: params.name,
      },
    });
    return fromDestinationModel(model);
  }

  public async getWriterByProviderId(providerId: string): Promise<DestinationWriter | null> {
    const destination = await this.getDestinationByProviderId(providerId);
    if (!destination) {
      return null;
    }

    return this.getWriterByDestination(destination);
  }

  public async getWriterByDestinationId(destinationId: string): Promise<DestinationWriter | null> {
    const destination = await this.getDestinationById(destinationId);
    if (!destination) {
      return null;
    }

    return this.getWriterByDestination(destination);
  }

  private getWriterByDestination(destination: Destination): DestinationWriter | null {
    switch (destination.type) {
      case 's3':
        return new S3DestinationWriter(destination);
      case 'postgres':
        return new PostgresDestinationWriter(destination);
      case 'bigquery':
        return new BigQueryDestinationWriter(destination);
      case 'mongodb':
        return new MongoDBDestinationWriter(destination);
      default:
        return null;
    }
  }
}
