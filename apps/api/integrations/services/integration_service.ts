import { PrismaClient } from '@prisma/client';
import { DeveloperConfigService } from '../../developer_config/services';
import { NotFoundError } from '../../errors';
import { encrypt } from '../../lib/crypt';
import { SyncService } from '../../syncs/services';
import {
  fromModelToSafeIntegration,
  fromModelToUnsafeIntegration,
  IntegrationCreateParams,
  SafeIntegration,
  UnsafeIntegration,
} from '../entities';

export class IntegrationService {
  #prisma: PrismaClient;
  #developerConfigService: DeveloperConfigService;
  #syncService: SyncService;

  constructor(prisma: PrismaClient, developerConfigService: DeveloperConfigService, syncService: SyncService) {
    this.#prisma = prisma;
    this.#developerConfigService = developerConfigService;
    this.#syncService = syncService;
  }

  public async getById(id: string, unsafe?: false): Promise<SafeIntegration>;
  public async getById(id: string, unsafe?: true): Promise<UnsafeIntegration>;
  public async getById(id: string, unsafe?: undefined): Promise<SafeIntegration>;
  public async getById(id: string, unsafe = false): Promise<SafeIntegration | UnsafeIntegration> {
    const integration = await this.#prisma.integration.findUnique({
      where: {
        id,
      },
    });
    if (!integration) {
      throw new Error(`Can't find integration with id: ${id}`);
    }
    if (unsafe) {
      return fromModelToUnsafeIntegration(integration);
    }

    return fromModelToSafeIntegration(integration);
  }

  public async getByCustomerIdAndType(customerId: string, type: string, unsafe?: false): Promise<SafeIntegration>;
  public async getByCustomerIdAndType(customerId: string, type: string, unsafe?: true): Promise<UnsafeIntegration>;
  public async getByCustomerIdAndType(customerId: string, type: string, unsafe?: undefined): Promise<SafeIntegration>;
  public async getByCustomerIdAndType(
    customerId: string,
    type: string,
    unsafe = false
  ): Promise<SafeIntegration | UnsafeIntegration> {
    const integration = await this.#prisma.integration.findFirst({
      where: {
        customerId,
        type,
      },
    });
    if (!integration) {
      throw new NotFoundError(`Can't find integration with customerId: ${customerId} and type: ${type}`);
    }
    if (unsafe) {
      return fromModelToUnsafeIntegration(integration);
    }
    return fromModelToSafeIntegration(integration);
  }

  public async create({ customerId, type, credentials }: IntegrationCreateParams): Promise<SafeIntegration> {
    // TODO: Make this transactional
    const integration = await this.#prisma.integration.create({
      data: {
        customerId,
        type,
        credentials: encrypt(JSON.stringify(credentials)),
      },
    });
    const developerConfig = await this.#developerConfigService.findDeveloperConfig();
    if (developerConfig) {
      await Promise.all(
        developerConfig.getSyncConfigs().map((syncConfig) =>
          this.#syncService.createSync(
            {
              customerId,
              syncConfigName: syncConfig.name,
              enabled: false,
            },
            developerConfig
          )
        )
      );
    }

    return fromModelToSafeIntegration(integration);
  }

  public async delete(integrationId: string): Promise<void> {
    return await this.#prisma.$transaction(async (tx) => {
      const integration = await tx.integration.findUniqueOrThrow({ where: { id: integrationId } });
      await Promise.all([
        this.#syncService.deleteSyncsForCustomer(tx, integration.customerId),
        tx.integration.delete({ where: { id: integration.id } }),
      ]);
    });
  }
}
