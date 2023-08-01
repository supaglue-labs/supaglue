import type { PrismaClient } from '@supaglue/db';
import type { PaginatedResult } from '@supaglue/types/common';
import type { ObjectType, Sync, SyncDTO, SyncFilter } from '@supaglue/types/sync';
import type { ConnectionService } from '.';
import { NotFoundError } from '../errors';
import { getCustomerIdPk } from '../lib';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromSyncModel, fromSyncModelWithConnection } from '../mappers/sync';

export class SyncService {
  #prisma: PrismaClient;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#connectionService = connectionService;
  }

  public async list(args: SyncFilter): Promise<PaginatedResult<SyncDTO>> {
    const { applicationId, paginationParams, externalCustomerId, providerName } = args;
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    // TODO: do this with a joined query instead
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const connectionIds = connections.map(({ id }) => id);
    const { page_size, cursor } = paginationParams;
    const modelsPromise = this.#prisma.sync.findMany({
      ...getPaginationParams<string>(page_size, cursor),
      where: {
        connectionId: { in: connectionIds },
        objectType: 'objectType' in args ? args.objectType : undefined,
        object: 'object' in args ? args.object : undefined,
        entityId: 'entityId' in args ? args.entityId : undefined,
      },
      include: {
        connection: true,
      },
    });
    const countPromise = this.#prisma.sync.count({
      where: {
        connectionId: { in: connectionIds },
        objectType: 'objectType' in args ? args.objectType : undefined,
        object: 'object' in args ? args.object : undefined,
        entityId: 'entityId' in args ? args.entityId : undefined,
      },
    });

    const [models, count] = await Promise.all([modelsPromise, countPromise]);

    const results = models.map(fromSyncModelWithConnection);

    return {
      ...getPaginationResult<string>(page_size, cursor, results),
      results,
      totalCount: count,
    };
  }

  public async findByConnectionIdAndObjectTypeAndObject(
    connectionId: string,
    objectType: ObjectType,
    object: string
  ): Promise<Sync | undefined> {
    const model = await this.#prisma.sync.findUnique({
      where: {
        connectionId_type_objectType_object: {
          connectionId,
          type: 'object',
          object,
          objectType,
        },
      },
    });
    if (!model) {
      return;
    }
    return fromSyncModel(model);
  }

  public async getByConnectionIdAndObjectTypeAndObject(
    connectionId: string,
    objectType: ObjectType,
    object: string
  ): Promise<Sync> {
    const sync = await this.findByConnectionIdAndObjectTypeAndObject(connectionId, objectType, object);
    if (!sync) {
      throw new NotFoundError(
        `Sync not found for connectionId: ${connectionId}, objectType: ${objectType}, object: ${object}`
      );
    }
    return sync;
  }

  public async findByConnectionIdAndEntity(connectionId: string, entityId: string): Promise<Sync | undefined> {
    const model = await this.#prisma.sync.findUnique({
      where: {
        connectionId_type_entityId: {
          connectionId,
          type: 'entity',
          entityId,
        },
      },
    });
    if (!model) {
      return;
    }
    return fromSyncModel(model);
  }

  public async getByConnectionIdAndEntity(connectionId: string, entityId: string): Promise<Sync> {
    const sync = await this.findByConnectionIdAndEntity(connectionId, entityId);
    if (!sync) {
      throw new NotFoundError(`Sync not found for connectionId: ${connectionId}, entityId: ${entityId}`);
    }
    return sync;
  }
}
