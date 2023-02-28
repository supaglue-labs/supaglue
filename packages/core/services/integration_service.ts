import { PrismaClient } from '@prisma/client';
import { NotFoundError } from '../errors';
import { fromIntegrationModel } from '../mappers';
import { Integration } from '../types';

export class IntegrationService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getById(id: string): Promise<Integration> {
    const integration = await this.#prisma.integration.findUnique({
      where: { id },
    });
    if (!integration) {
      throw new NotFoundError(`Can't find integration with id: ${id}`);
    }
    return fromIntegrationModel(integration);
  }

  public async getByProviderName(providerName: string): Promise<Integration> {
    const integration = await this.#prisma.integration.findUnique({
      where: {
        providerName,
      },
    });
    if (!integration) {
      throw new NotFoundError(`Integration not found for provider name: ${providerName}`);
    }
    return fromIntegrationModel(integration);
  }
}
