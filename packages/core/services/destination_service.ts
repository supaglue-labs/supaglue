import type { PrismaClient } from '@supaglue/db';
import type { Destination, DestinationCreateParams, DestinationUpdateParams } from '@supaglue/types';
import { DestinationWriter } from '../destination_writers/base';
import { PostgresDestinationWriter } from '../destination_writers/postgres';
import { S3DestinationWriter } from '../destination_writers/s3';
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

  public async getDestinationById(id: string): Promise<Destination> {
    const model = await this.#prisma.destination.findUniqueOrThrow({
      where: { id },
    });
    return fromDestinationModel(model);
  }

  public async createDestination(params: DestinationCreateParams): Promise<Destination> {
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

  public async updateDestination(params: DestinationUpdateParams): Promise<Destination> {
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
