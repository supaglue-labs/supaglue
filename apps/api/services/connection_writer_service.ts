import { sendWebhookPayload } from '@supaglue/core/lib';
import { encrypt } from '@supaglue/core/lib/crypt';
import { getCustomerIdPk } from '@supaglue/core/lib/customer_id';
import { fromConnectionModelToConnectionUnsafe } from '@supaglue/core/mappers/connection';
import { ApplicationService, IntegrationService } from '@supaglue/core/services';
import type {
  ConnectionCreateParams,
  ConnectionStatus,
  ConnectionUnsafe,
  ConnectionUpsertParams,
} from '@supaglue/core/types/connection';
import type { PrismaClient } from '@supaglue/db';
import type { SyncService } from './sync_service';

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

export class ConnectionWriterService {
  #prisma: PrismaClient;
  #syncService: SyncService;
  #integrationService: IntegrationService;
  #applicationService: ApplicationService;

  constructor(
    prisma: PrismaClient,
    syncService: SyncService,
    integrationService: IntegrationService,
    applicationService: ApplicationService
  ) {
    this.#prisma = prisma;
    this.#syncService = syncService;
    this.#integrationService = integrationService;
    this.#applicationService = applicationService;
  }

  public async upsert(params: ConnectionUpsertParams): Promise<ConnectionUnsafe> {
    const integration = await this.#prisma.integration.findUnique({
      where: {
        applicationId_providerName: {
          applicationId: params.applicationId,
          providerName: params.providerName,
        },
      },
    });
    if (!integration) {
      throw new Error(`No integration found for ${params.providerName}`);
    }
    const status: ConnectionStatus = 'added';
    const customerId = getCustomerIdPk(params.applicationId, params.customerId);
    const connection = await this.#prisma.connection.upsert({
      create: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        integrationId: integration.id,
        status,
        credentials: encrypt(JSON.stringify(params.credentials)),
      },
      update: {
        category: params.category,
        providerName: params.providerName,
        customerId,
        integrationId: integration.id,
        status,
        credentials: encrypt(JSON.stringify(params.credentials)),
      },
      where: {
        customerId_integrationId: {
          customerId: customerId,
          integrationId: integration.id,
        },
      },
    });

    return fromConnectionModelToConnectionUnsafe(connection);
  }

  public async create(params: ConnectionCreateParams): Promise<ConnectionUnsafe> {
    const integration = await this.#integrationService.getByProviderNameAndApplicationId(
      params.providerName,
      params.applicationId
    );
    const application = await this.#applicationService.getById(integration.applicationId);
    let errored = false;

    try {
      // TODO: Is this the correct status?
      const status: ConnectionStatus = 'added';
      const connectionModel = await this.#prisma.connection.create({
        data: {
          category: params.category,
          providerName: params.providerName,
          customerId: getCustomerIdPk(params.applicationId, params.customerId),
          integrationId: integration.id,
          status,
          credentials: encrypt(JSON.stringify(params.credentials)),
          remoteId: params.remoteId,
        },
      });
      const connection = fromConnectionModelToConnectionUnsafe(connectionModel);

      if (integration.config) {
        // TODO: We need do this transactionally and not best-effort. Maybe transactionally write
        // an event to another table and have a background job pick this up to guarantee
        // that we start up syncs when connections are created.
        // TODO: Do this for non-CRM models
        await this.#syncService.createSync(connection, integration.config.sync.periodMs ?? FIFTEEN_MINUTES_MS);
      }
      return connection;
    } catch (e) {
      errored = true;
      throw e;
    } finally {
      if (application.config.webhook) {
        await sendWebhookPayload(
          application.config.webhook,
          errored ? 'CONNECTION_ERROR' : 'CONNECTION_SUCCESS',
          params
        );
      }
    }
  }
}
