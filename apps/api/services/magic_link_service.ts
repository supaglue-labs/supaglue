import { BadRequestError, NotFoundError } from '@supaglue/core/errors';
import { fromMagicLinkModel } from '@supaglue/core/mappers';
import type { CustomerService, ProviderService } from '@supaglue/core/services';
import type { PrismaClient } from '@supaglue/db';
import type { MagicLink, MagicLinkConsumeParams, MagicLinkCreateParams } from '@supaglue/types';
import { v4 as uuidv4 } from 'uuid';
import type { ConnectionAndSyncService } from '.';

const BASE_URL = process.env.SUPAGLUE_MAGIC_LINK_URL ?? 'http://localhost:3000/links';

export class MagicLinkService {
  #prisma: PrismaClient;
  #customerService: CustomerService;
  #providerService: ProviderService;
  #connectionAndSyncService: ConnectionAndSyncService;

  constructor(
    prisma: PrismaClient,
    customerService: CustomerService,
    providerService: ProviderService,
    connectionAndSyncService: ConnectionAndSyncService
  ) {
    this.#prisma = prisma;
    this.#customerService = customerService;
    this.#providerService = providerService;
    this.#connectionAndSyncService = connectionAndSyncService;
  }

  public async listByApplicationId(applicationId: string): Promise<MagicLink[]> {
    const magicLinks = await this.#prisma.magicLink.findMany({
      where: {
        applicationId,
      },
    });
    return magicLinks.map((magicLink) => fromMagicLinkModel(magicLink));
  }

  public async findById(id: string): Promise<MagicLink | null> {
    const magicLink = await this.#prisma.magicLink.findUnique({
      where: { id },
    });
    if (!magicLink) {
      return null;
    }
    return fromMagicLinkModel(magicLink);
  }

  public async getByIdAndApplicationId(id: string, applicationId: string): Promise<MagicLink> {
    const magicLink = await this.#prisma.magicLink.findUnique({
      where: { id },
    });
    if (!magicLink || magicLink.applicationId !== applicationId) {
      throw new NotFoundError(`Can't find magic link with id: ${id}`);
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
        providerName: params.providerName,
        applicationId,
        id,
        customerId: `${applicationId}:${params.customerId}`,
        providerId: provider.id,
        url,
        returnUrl: params.returnUrl,
        expiresAt: new Date(Date.now() + params.expirationSecs * 1000),
        status: 'new',
      },
    });
    return fromMagicLinkModel(magicLink);
  }

  public async consumeMagicLink(id: string, params?: MagicLinkConsumeParams): Promise<MagicLink> {
    const magicLink = await this.findById(id);
    if (!magicLink) {
      throw new NotFoundError(`Can't find magic link with id: ${id}`);
    }
    if (magicLink.status !== 'new') {
      throw new BadRequestError(`Magic link with id: ${id} has already been consumed`);
    }
    if (
      (magicLink.providerName === 'apollo' ||
        magicLink.providerName === 'clearbit' ||
        magicLink.providerName === '6sense') &&
      params?.type === 'api_key'
    ) {
      await this.#connectionAndSyncService.createManually(magicLink.applicationId, magicLink.customerId, {
        providerName: magicLink.providerName,
        type: 'api_key',
        apiKey: params.apiKey,
      });
    } else if (magicLink.providerName === 'gong' && params?.type === 'access_key_secret') {
      await this.#connectionAndSyncService.createManually(magicLink.applicationId, magicLink.customerId, {
        providerName: 'gong',
        type: 'access_key_secret',
        accessKey: params.accessKey,
        accessKeySecret: params.accessKeySecret,
      });
    } else if (magicLink.providerName === 'marketo' && params?.type === 'marketo_oauth2') {
      await this.#connectionAndSyncService.createManually(magicLink.applicationId, magicLink.customerId, {
        providerName: 'marketo',
        type: 'marketo_oauth2',
        clientId: params.clientId,
        clientSecret: params.clientSecret,
        instanceUrl: params.instanceUrl,
      });
    }

    const updatedMagicLink = await this.#prisma.magicLink.update({
      where: { id },
      data: {
        status: 'consumed',
      },
    });
    return fromMagicLinkModel(updatedMagicLink);
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
