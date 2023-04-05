import type { PrismaClient } from '@supaglue/db';
import type { CRMIntegrationCreateParams, CRMIntegrationUpdateParams, Integration } from '@supaglue/types';
import { NotFoundError } from '../errors';
import { fromIntegrationModel, toIntegrationModel } from '../mappers';

export class IntegrationService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getByIds(ids: string[]): Promise<Integration[]> {
    const integrations = await this.#prisma.integration.findMany({
      where: { id: { in: ids } },
    });
    return integrations.map(fromIntegrationModel);
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

  public async getByIdAndApplicationId(id: string, applicationId: string): Promise<Integration> {
    const integration = await this.#prisma.integration.findUnique({
      where: { id },
    });
    if (!integration || integration.applicationId !== applicationId) {
      throw new NotFoundError(`Can't find integration with id: ${id}`);
    }
    return fromIntegrationModel(integration);
  }

  public async getByProviderNameAndApplicationId(providerName: string, applicationId: string): Promise<Integration> {
    const integration = await this.#prisma.integration.findUnique({
      where: {
        applicationId_providerName: {
          applicationId,
          providerName,
        },
      },
    });
    if (!integration) {
      throw new NotFoundError(`Integration not found for provider name: ${providerName}`);
    }
    return fromIntegrationModel(integration);
  }

  // TODO: paginate
  public async list(applicationId: string): Promise<Integration[]> {
    const integrations = await this.#prisma.integration.findMany({ where: { applicationId } });
    return integrations.map(fromIntegrationModel);
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

  public async delete(id: string, applicationId: string): Promise<void> {
    await this.#prisma.integration.deleteMany({
      where: { id, applicationId },
    });
  }
}
