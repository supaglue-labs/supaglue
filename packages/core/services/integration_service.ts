import type { PrismaClient } from '@supaglue/db';
import type {
  Destination,
  Integration,
  IntegrationCreateParams,
  IntegrationUpdateParams,
  ProviderCreateParams,
  SyncConfigCreateParams,
} from '@supaglue/types';
import { getDefaultCommonObjects } from '.';
import { BadRequestError, NotFoundError } from '../errors';
import { fromIntegrationModel, toIntegrationModel, toProviderModel, toSyncConfigModel } from '../mappers';
import { fromDestinationModel } from '../mappers/destination';

export class IntegrationService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async getByIds(ids: string[]): Promise<Integration[]> {
    const integrations = await this.#prisma.integration.findMany({
      where: { id: { in: ids } },
    });
    return Promise.all(integrations.map(fromIntegrationModel));
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
    return Promise.all(integrations.map(fromIntegrationModel));
  }

  public async create(integration: IntegrationCreateParams): Promise<Integration> {
    const createdIntegration = await this.#prisma.integration.create({
      data: await toIntegrationModel(integration),
    });
    const { id } = await this.#prisma.provider.create({
      data: await toProviderModel(toProviderCreateParams(integration)),
    });
    if (integration.destinationId) {
      const destination = await this.#prisma.destination.findUniqueOrThrow({
        where: {
          id: integration.destinationId,
        },
      });
      const syncConfigParams = toSyncConfigCreateParams(integration, id, fromDestinationModel(destination));
      await this.#prisma.syncConfig.create({
        data: syncConfigParams,
      });
    }
    return fromIntegrationModel(createdIntegration);
  }

  public async update(id: string, integration: IntegrationUpdateParams): Promise<Integration> {
    // TODO(SUP1-328): Remove once we support updating destinations
    if (integration.destinationId) {
      const { destinationId } = await this.getById(id);
      if (destinationId && destinationId !== integration.destinationId) {
        throw new BadRequestError('Destination cannot be changed');
      }
    }
    const provider = await this.#prisma.provider.findUnique({
      where: {
        applicationId_name: {
          applicationId: integration.applicationId,
          name: integration.providerName,
        },
      },
    });
    const [updatedIntegration] = await this.#prisma.$transaction([
      this.#prisma.integration.update({
        where: { id },
        data: await toIntegrationModel(integration),
      }),
      this.#prisma.integrationChange.create({
        data: {
          integrationId: id,
        },
      }),
    ]);

    if (!provider) {
      return fromIntegrationModel(updatedIntegration);
    }

    await this.#prisma.provider.update({
      where: { id: provider.id },
      data: await toProviderModel(toProviderCreateParams(integration)),
    });

    const syncConfig = await this.#prisma.syncConfig.findUnique({
      where: {
        providerId: provider.id,
      },
    });
    if (!syncConfig) {
      return fromIntegrationModel(updatedIntegration);
    }

    const destination = await this.#prisma.destination.findUniqueOrThrow({
      where: {
        id: syncConfig.destinationId,
      },
    });

    await this.#prisma.$transaction([
      this.#prisma.syncConfig.update({
        where: { id: syncConfig.id },
        data: await toSyncConfigModel(
          toSyncConfigCreateParams(integration, provider.id, fromDestinationModel(destination))
        ),
      }),
      this.#prisma.syncConfigChange.create({
        data: {
          syncConfigId: syncConfig.id,
        },
      }),
    ]);
    // TODO: implement best-effort trigger schedule to process sync changes

    return fromIntegrationModel(updatedIntegration);
  }

  public async delete(id: string, applicationId: string): Promise<void> {
    await this.#prisma.integration.deleteMany({
      where: { id, applicationId },
    });
  }
}

const toProviderCreateParams = (integration: IntegrationCreateParams): ProviderCreateParams => {
  return {
    applicationId: integration.applicationId,
    category: integration.category,
    authType: 'oauth2',
    name: integration.providerName,
    config: {
      providerAppId: integration.config.providerAppId,
      oauth: integration.config.oauth,
    },
  } as ProviderCreateParams;
};

const toSyncConfigCreateParams = (
  integration: IntegrationCreateParams,
  providerId: string,
  destination: Destination
): SyncConfigCreateParams => {
  return {
    applicationId: integration.applicationId,
    destinationId: destination.id,
    providerId,
    config: {
      defaultConfig: {
        periodMs: integration.config.sync.periodMs,
        strategy: destination.type === 's3' ? 'full only' : 'full then incremental',
      },
      commonObjects: getDefaultCommonObjects(integration.category, false),
      rawObjects: [],
    },
  };
};
