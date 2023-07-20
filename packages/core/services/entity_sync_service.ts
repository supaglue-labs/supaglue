import type { PrismaClient } from '@supaglue/db';
import type { PaginatedResult } from '@supaglue/types/common';
import type { EntitySync, EntitySyncDTO, EntitySyncFilter } from '@supaglue/types/entity_sync';
import type { ConnectionService } from '.';
import { NotFoundError } from '../errors';
import { getCustomerIdPk } from '../lib';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromEntitySyncModel, fromEntitySyncModelWithConnection } from '../mappers/entity_sync';

export class EntitySyncService {
  #prisma: PrismaClient;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#connectionService = connectionService;
  }

  public async list(args: EntitySyncFilter): Promise<PaginatedResult<EntitySyncDTO>> {
    const { applicationId, paginationParams, externalCustomerId, providerName } = args;
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    // TODO: do this with a joined query instead
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const connectionIds = connections.map(({ id }) => id);
    const { page_size, cursor } = paginationParams;
    const modelsPromise = this.#prisma.entitySync.findMany({
      ...getPaginationParams<string>(page_size, cursor),
      where: {
        connectionId: { in: connectionIds },
        entityId: args.entityId,
      },
      include: {
        connection: true,
      },
    });
    const countPromise = this.#prisma.entitySync.count({
      where: {
        connectionId: { in: connectionIds },
        entityId: args.entityId,
      },
    });

    const [models, count] = await Promise.all([modelsPromise, countPromise]);

    const results = models.map(fromEntitySyncModelWithConnection);

    return {
      ...getPaginationResult<string>(page_size, cursor, results),
      results,
      totalCount: count,
    };
  }

  public async getByConnectionIdAndEntityTypeAndEntity(connectionId: string, entityId: string): Promise<EntitySync> {
    const model = await this.#prisma.entitySync.findUnique({
      where: {
        connectionId_entityId: {
          connectionId,
          entityId,
        },
      },
    });
    if (!model) {
      throw new NotFoundError(`EntitySync not found for connectionId: ${connectionId}, entityId: ${entityId}`);
    }
    return fromEntitySyncModel(model);
  }
}
