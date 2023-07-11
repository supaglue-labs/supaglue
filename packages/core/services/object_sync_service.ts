import type { PrismaClient } from '@supaglue/db';
import type { PaginatedResult } from '@supaglue/types/common';
import type { ObjectSync, ObjectSyncFilter, ObjectType } from '@supaglue/types/object_sync';
import { NotFoundError } from '../errors';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromObjectSyncModel } from '../mappers/object_sync';

export class ObjectSyncService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async list(args: ObjectSyncFilter): Promise<PaginatedResult<ObjectSync>> {
    const { connectionId, paginationParams } = args;
    const { page_size, cursor } = paginationParams;
    const modelsPromise = this.#prisma.objectSync.findMany({
      ...getPaginationParams<string>(page_size, cursor),
      where: {
        connectionId,
        objectType: 'objectType' in args ? args.objectType : undefined,
        object: 'object' in args ? args.object : undefined,
      },
    });
    const countPromise = this.#prisma.objectSync.count({
      where: {
        connectionId,
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
