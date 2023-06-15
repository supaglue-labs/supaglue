import { ListBucketsCommand, S3Client } from '@aws-sdk/client-s3';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import type { PrismaClient } from '@supaglue/db';
import type {
  Destination,
  DestinationCreateParams,
  DestinationTestParams,
  DestinationTestResult,
  DestinationUpdateParams,
} from '@supaglue/types';
import { Client } from 'pg';
import { DestinationWriter } from '../destination_writers/base';
import { PostgresDestinationWriter } from '../destination_writers/postgres';
import { S3DestinationWriter } from '../destination_writers/s3';
import { BadRequestError } from '../errors';
import { fromDestinationModel } from '../mappers/destination';

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

  public async getDestinationByIntegrationId(integrationId: string): Promise<Destination | null> {
    const model = await this.#prisma.destination.findFirst({
      where: { integrations: { some: { id: integrationId } } },
    });
    if (!model) {
      return null;
    }
    return fromDestinationModel(model);
  }

  public async getDestinationByConnectionId(connectionId: string): Promise<Destination | null> {
    const { integrationId } = await this.#prisma.connection.findUniqueOrThrow({
      where: { id: connectionId },
    });
    return await this.getDestinationByIntegrationId(integrationId);
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

  public async getWriterByIntegrationId(integrationId: string): Promise<DestinationWriter | null> {
    const destination = await this.getDestinationByIntegrationId(integrationId);
    if (!destination) {
      return null;
    }
    switch (destination.type) {
      case 's3':
        return new S3DestinationWriter(destination);
      case 'postgres':
        return new PostgresDestinationWriter(destination);
    }
  }
}
