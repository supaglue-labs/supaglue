import type { PrismaClient } from '@supaglue/db';
import type { PaginatedResult } from '@supaglue/types/common';
import type { ObjectSync, ObjectSyncDTO, ObjectSyncFilter, ObjectType } from '@supaglue/types/object_sync';
import type { ConnectionService } from '.';
import { NotFoundError } from '../errors';
import { getCustomerIdPk } from '../lib';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromObjectSyncModel, fromObjectSyncModelWithConnection } from '../mappers/object_sync';

export class ObjectSyncService {
  #prisma: PrismaClient;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#connectionService = connectionService;
  }

  public async list(args: ObjectSyncFilter): Promise<PaginatedResult<ObjectSyncDTO>> {
    const { applicationId, paginationParams, externalCustomerId, providerName } = args;
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    // TODO: do this with a joined query instead
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const connectionIds = connections.map(({ id }) => id);
    const { page_size, cursor } = paginationParams;
    const modelsPromise = this.#prisma.objectSync.findMany({
      ...getPaginationParams<string>(page_size, cursor),
      where: {
        connectionId: { in: connectionIds },
        objectType: 'objectType' in args ? args.objectType : undefined,
        object: 'object' in args ? args.object : undefined,
      },
      include: {
        connection: true,
      },
    });
    const countPromise = this.#prisma.objectSync.count({
      where: {
        connectionId: { in: connectionIds },
        objectType: 'objectType' in args ? args.objectType : undefined,
        object: 'object' in args ? args.object : undefined,
      },
    });

    const [models, count] = await Promise.all([modelsPromise, countPromise]);

    const results = models.map(fromObjectSyncModelWithConnection);

    return {
      ...getPaginationResult<string>(page_size, cursor, results),
      results,
      totalCount: count,
    };
  }

  public async getByConnectionIdAndObjectTypeAndObject(
    connectionId: string,
    objectType: ObjectType,
    object: string
  ): Promise<ObjectSync> {
    const model = await this.#prisma.objectSync.findUnique({
      where: {
        connectionId_objectType_object: {
          connectionId,
          object,
          objectType,
        },
      },
    });
    if (!model) {
      throw new NotFoundError(
        `ObjectSync not found for connectionId: ${connectionId}, objectType: ${objectType}, object: ${object}`
      );
    }
    return fromObjectSyncModel(model);
  }
}
