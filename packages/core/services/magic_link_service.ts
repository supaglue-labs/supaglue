import type { PrismaClient } from '@supaglue/db';
import type { MagicLink, MagicLinkCreateParams } from '@supaglue/types';
import { v4 as uuidv4 } from 'uuid';
import type { CustomerService, ProviderService } from '.';
import { NotFoundError } from '../errors';
import { fromMagicLinkModel } from '../mappers';

const BASE_URL = process.env.SUPAGLUE_MAGIC_LINK_URL ?? 'http://localhost:3000/links';

export class MagicLinkService {
  #prisma: PrismaClient;
  #customerService: CustomerService;
  #providerService: ProviderService;

  constructor(prisma: PrismaClient, customerService: CustomerService, providerService: ProviderService) {
    this.#prisma = prisma;
    this.#customerService = customerService;
    this.#providerService = providerService;
  }

  public async listByApplicationId(applicationId: string): Promise<MagicLink[]> {
    const magicLinks = await this.#prisma.magicLink.findMany({
      where: {
        applicationId,
      },
    });
    return magicLinks.map((magicLink) => fromMagicLinkModel(magicLink));
  }

  public async getById(id: string): Promise<MagicLink> {
    const magicLink = await this.#prisma.magicLink.findUnique({
      where: { id },
    });
    if (!magicLink) {
      throw new NotFoundError(`Can't find provider with id: ${id}`);
    }
    return fromMagicLinkModel(magicLink);
  }

  public async getByIdAndApplicationId(id: string, applicationId: string): Promise<MagicLink> {
    const magicLink = await this.#prisma.magicLink.findUnique({
      where: { id },
    });
    if (!magicLink || magicLink.applicationId !== applicationId) {
      throw new NotFoundError(`Can't find provider with id: ${id}`);
    }

    return fromMagicLinkModel(magicLink);
  }

  public async createMagicLink(applicationId: string, params: MagicLinkCreateParams): Promise<MagicLink> {
    const id = uuidv4();
    await this.#customerService.getByExternalId(applicationId, params.customerId);
    const provider = await this.#providerService.getByNameAndApplicationId(params.providerName, applicationId);
    const url = this.generateMagicLinkUrl(id);
    const magicLink = await this.#prisma.magicLink.create({
      data: {
        ...params,
        applicationId,
        id,
        customerId: `${applicationId}:${params.customerId}`,
        providerId: provider.id,
        url,
        expiresAt: new Date(Date.now() + params.expirationSecs * 1000),
        status: 'created',
      },
    });
    return fromMagicLinkModel(magicLink);
  }

  public async deleteMagicLink(applicationId: string, id: string): Promise<void> {
    await this.#prisma.magicLink.deleteMany({
      where: { id, applicationId },
    });
  }

  private generateMagicLinkUrl(id: string): string {
    return `${BASE_URL}/${id}`;
  }
}