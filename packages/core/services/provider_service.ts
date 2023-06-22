import type { PrismaClient } from '@supaglue/db';
import type { Provider, ProviderCreateParams, ProviderUpdateParams } from '@supaglue/types';
import { BadRequestError, NotFoundError } from '../errors';
import { fromProviderModel, toProviderModel } from '../mappers';

export class ProviderService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getByIds(ids: string[]): Promise<Provider[]> {
    const providers = await this.#prisma.provider.findMany({
      where: { id: { in: ids } },
    });
    return Promise.all(providers.map((provider) => fromProviderModel(provider)));
  }

  public async getById(id: string): Promise<Provider> {
    const provider = await this.#prisma.provider.findUnique({
      where: { id },
    });
    if (!provider) {
      throw new NotFoundError(`Can't find provider with id: ${id}`);
    }
    return fromProviderModel(provider);
  }

  public async getByIdAndApplicationId(id: string, applicationId: string): Promise<Provider> {
    const provider = await this.#prisma.provider.findUnique({
      where: { id },
    });
    if (!provider || provider.applicationId !== applicationId) {
      throw new NotFoundError(`Can't find provider with id: ${id}`);
    }

    return fromProviderModel(provider);
  }

  public async getByNameAndApplicationId(name: string, applicationId: string): Promise<Provider> {
    const provider = await this.#prisma.provider.findUnique({
      where: {
        applicationId_name: {
          applicationId,
          name,
        },
      },
    });
    if (!provider) {
      throw new NotFoundError(`Provider not found for name: ${name}`);
    }
    return fromProviderModel(provider);
  }

  public async list(applicationId: string): Promise<Provider[]> {
    const providers = await this.#prisma.provider.findMany({ where: { applicationId } });
    return Promise.all(providers.map((provider) => fromProviderModel(provider)));
  }

  public async create(provider: ProviderCreateParams): Promise<Provider> {
    const createdProvider = await this.#prisma.provider.create({
      data: await toProviderModel(provider),
    });
    return fromProviderModel(createdProvider);
  }

  public async update(id: string, provider: ProviderUpdateParams): Promise<Provider> {
    const updatedProvider = await this.#prisma.provider.update({
      where: { id },
      data: await toProviderModel(provider),
    });
    return fromProviderModel(updatedProvider);
  }

  public async upsert(provider: ProviderCreateParams): Promise<Provider> {
    const upsertedProvider = await this.#prisma.provider.upsert({
      where: {
        applicationId_name: {
          applicationId: provider.applicationId,
          name: provider.name,
        },
      },
      create: await toProviderModel(provider),
      update: await toProviderModel(provider),
    });
    return fromProviderModel(upsertedProvider);
  }

  public async delete(id: string, applicationId: string): Promise<void> {
    const syncConfigs = await this.#prisma.syncConfig.findMany({
      where: { providerId: id },
    });
    if (syncConfigs.length) {
      throw new BadRequestError(`Can't delete provider with id: ${id} as it has syncConfigs`);
    }
    const connections = await this.#prisma.connection.findMany({
      where: { providerId: id },
    });
    if (connections.length) {
      throw new BadRequestError(`Can't delete provider with active connections`);
    }

    await this.#prisma.provider.deleteMany({
      where: { id, applicationId },
    });
  }
}
