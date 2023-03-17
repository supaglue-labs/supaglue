import type { PrismaClient } from '@supaglue/db';
import { NotFoundError } from '../errors';
import { fromIntegrationModel, toIntegrationModel } from '../mappers';
import type { CRMIntegrationCreateParams, CRMIntegrationUpdateParams, Integration } from '../types';

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

  // TODO: paginate
  public async list(): Promise<Integration[]> {
    const integrations = await this.#prisma.integration.findMany();
    return integrations.map((integration) => fromIntegrationModel(integration));
  }

  public async create(integration: CRMIntegrationCreateParams): Promise<Integration> {
    const createdIntegration = await this.#prisma.integration.create({
      data: toIntegrationModel(integration),
    });
    return fromIntegrationModel(createdIntegration);
  }

  public async update(id: string, integration: CRMIntegrationUpdateParams): Promise<Integration> {
    const updatedIntegration = await this.#prisma.integration.update({
      where: { id },
      data: toIntegrationModel(integration),
    });
    return fromIntegrationModel(updatedIntegration);
  }

  public async delete(id: string): Promise<Integration> {
    const deletedIntegration = await this.#prisma.integration.delete({
      where: { id },
    });
    return fromIntegrationModel(deletedIntegration);
  }
}
