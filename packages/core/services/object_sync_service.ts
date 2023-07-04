import type { PrismaClient } from '@supaglue/db';
import type { PaginatedResult } from '@supaglue/types/common';
import type { ObjectSync, ObjectSyncFilter } from '@supaglue/types/object_sync';
import type { ConnectionService } from '.';
import { getCustomerIdPk } from '../lib/customer_id';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromObjectSyncModel } from '../mappers/object_sync';

export class ObjectSyncService {
  #prisma: PrismaClient;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#connectionService = connectionService;
  }

  public async list(args: ObjectSyncFilter): Promise<PaginatedResult<ObjectSync>> {
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
    });
    const countPromise = this.#prisma.objectSync.count({
      where: {
        connectionId: { in: connectionIds },
        objectType: 'objectType' in args ? args.objectType : undefined,
        object: 'object' in args ? args.object : undefined,
      },
    });

    const [models, count] = await Promise.all([modelsPromise, countPromise]);

    const results = models.map(fromObjectSyncModel);

    return {
      ...getPaginationResult<string>(page_size, cursor, results),
      results,
      totalCount: count,
    };
  }
}
