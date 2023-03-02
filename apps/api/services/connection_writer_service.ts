import { fromConnectionModel } from '@supaglue/core/mappers/connection';
import type {
  Connection,
  ConnectionCreateParams,
  ConnectionStatus,
  ConnectionUpsertParams,
} from '@supaglue/core/types/connection';
import type { PrismaClient } from '@supaglue/db';
import type { SyncService } from './sync_service';

export class ConnectionWriterService {
  #prisma: PrismaClient;
  #syncService: SyncService;

  constructor(prisma: PrismaClient, syncService: SyncService) {
    this.#prisma = prisma;
    this.#syncService = syncService;
  }

  public async upsert(params: ConnectionUpsertParams): Promise<Connection> {
    const integration = await this.#prisma.integration.findUnique({
      where: {
        providerName: params.providerName,
      },
    });
    if (!integration) {
      throw new Error(`No integration found for ${params.providerName}`);
    }
    const status: ConnectionStatus = 'added';
    const connection = await this.#prisma.connection.upsert({
      create: {
        ...params,
        integrationId: integration.id,
        status,
        credentials: params.credentials,
      },
      update: {
        ...params,
        integrationId: integration.id,
        status,
        credentials: params.credentials,
      },
      where: {
        customerId_integrationId: {
          customerId: params.customerId,
          integrationId: integration.id,
        },
      },
    });

    return fromConnectionModel(connection);
  }

  public async create(params: ConnectionCreateParams): Promise<Connection> {
    const integration = await this.#prisma.integration.findUnique({
      where: {
        providerName: params.providerName,
      },
    });
    if (!integration) {
      throw new Error(`No integration found for ${params.providerName}`);
    }
    // TODO: Is this the correct status?
    const status: ConnectionStatus = 'added';
    const connection = await this.#prisma.connection.create({
      data: {
        ...params,
        integrationId: integration.id,
        status,
        credentials: params.credentials,
      },
    });

    // TODO: We need do this transactionally and not best-effort. Maybe transactionally write
    // an event to another table and have a background job pick this up to guarantee
    // that we start up syncs when connections are created.
    // TODO: Do this for non-CRM models
    await this.#syncService.createSyncsSchedule(connection.id);

    return fromConnectionModel(connection);
  }
}
