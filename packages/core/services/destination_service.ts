import type { PrismaClient } from '@supaglue/db';
import type { Destination, DestinationCreateParams, DestinationUpdateParams } from '@supaglue/types';
import { DestinationWriter } from '../destination_writers/base';
import { DESTINATION_ID_TO_POOL, PostgresDestinationWriter } from '../destination_writers/postgres';
import { NotFoundError } from '../errors';
import {
  fromDestinationModel,
  toPostgresDestinationConfigSafe,
  toS3DestinationConfigSafe,
} from '../mappers/destination';

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

  public async getDestinationByIntegrationId(integrationId: string): Promise<Destination> {
    const { destination } = await this.#prisma.integration.findUniqueOrThrow({
      where: {
        id: integrationId,
      },
      include: {
        destination: true,
      },
    });
    if (!destination) {
      throw new NotFoundError(`Destination not found for integration ${integrationId}`);
    }
    return fromDestinationModel(destination);
  }

  public async getDestinationById(id: string): Promise<Destination> {
    const model = await this.#prisma.destination.findUniqueOrThrow({
      where: { id },
    });
    return fromDestinationModel(model);
  }

  public async createDestination(params: DestinationCreateParams): Promise<Destination> {
    const safeConfig =
      params.type === 's3'
        ? await toS3DestinationConfigSafe(params.config)
        : await toPostgresDestinationConfigSafe(params.config);
    const model = await this.#prisma.destination.create({
      data: {
        name: params.name,
        applicationId: params.applicationId,
        type: params.type,
        config: safeConfig,
      },
    });
    return fromDestinationModel(model);
  }

  public async updateDestination(params: DestinationUpdateParams): Promise<Destination> {
    const safeConfig =
      params.type === 's3'
        ? await toS3DestinationConfigSafe(params.config)
        : await toPostgresDestinationConfigSafe(params.config);
    const model = await this.#prisma.destination.update({
      where: { id: params.id },
      data: {
        applicationId: params.applicationId,
        type: params.type,
        config: safeConfig,
        name: params.name,
      },
    });
    if (params.type === 'postgres') {
      delete DESTINATION_ID_TO_POOL[params.id];
    }
    return fromDestinationModel(model);
  }

  public async getWriterByIntegrationId(integrationId: string): Promise<DestinationWriter> {
    const destination = await this.getDestinationByIntegrationId(integrationId);
    switch (destination.type) {
      case 's3':
        throw new Error('S3 destination not implemented');
      case 'postgres':
        return new PostgresDestinationWriter(destination);
    }
  }
}
