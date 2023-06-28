import type { ObjectSyncRunModelExpanded } from '@supaglue/core/types/object_sync_run';
import { PrismaClient } from '@supaglue/db';
import type { PaginatedResult } from '@supaglue/types/common';
import type {
  ObjectSyncRun,
  ObjectSyncRunFilter,
  ObjectSyncRunStatus,
  ObjectSyncRunUpsertParams,
} from '@supaglue/types/object_sync_run';
import { ConnectionService } from '.';
import { getCustomerIdPk } from '../lib/customer_id';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromObjectSyncRunModelAndSync } from '../mappers/object_sync_run';

export class ObjectSyncRunService {
  #prisma: PrismaClient;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#connectionService = connectionService;
  }

  async #upsert({
    id,
    objectSyncId,
    createParams,
  }: {
    id: string;
    objectSyncId: string;
    createParams: ObjectSyncRunUpsertParams;
  }): Promise<ObjectSyncRun> {
    const created: ObjectSyncRunModelExpanded = await this.#prisma.objectSyncRun.upsert({
      where: { id },
      create: {
        ...createParams,
        id,
        objectSyncId,
      },
      update: {},
      include: {
        objectSync: {
          select: {
            id: true,
            connection: true,
          },
        },
      },
    });

    return fromObjectSyncRunModelAndSync(created);
  }

  async #update({
    id,
    updateParams,
  }: {
    id: string;
    updateParams: Partial<ObjectSyncRunUpsertParams>;
  }): Promise<ObjectSyncRun> {
    const model = await this.#prisma.objectSyncRun.update({
      where: { id },
      data: updateParams,
      include: {
        objectSync: {
          select: {
            id: true,
            connection: true,
          },
        },
      },
    });

    return fromObjectSyncRunModelAndSync(model);
  }

  public async logStart(args: { objectSyncId: string; runId: string }): Promise<string> {
    await this.#upsert({
      id: args.runId,
      objectSyncId: args.objectSyncId,
      createParams: {
        status: 'IN_PROGRESS' as const,
        errorMessage: null,
        startTimestamp: new Date(),
        endTimestamp: null,
        numRecordsSynced: null,
      },
    });
    return args.runId;
  }

  public async logFinish({
    runId,
    status,
    errorMessage,
    numRecordsSynced,
  }: {
    runId: string;
    status: ObjectSyncRunStatus;
    errorMessage?: string;
    numRecordsSynced: number | null;
  }): Promise<void> {
    await this.#update({
      id: runId,
      updateParams: {
        status,
        errorMessage: errorMessage ?? null,
        endTimestamp: new Date(),
        numRecordsSynced,
      },
    });
  }

  public async list(args: ObjectSyncRunFilter): Promise<PaginatedResult<ObjectSyncRun>> {
    // TODO: add prisma column
    const { applicationId, paginationParams, externalCustomerId, providerName } = args;
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const connectionIds = connections.map(({ id }) => id);
    const { page_size, cursor } = paginationParams;
    const modelsPromise = this.#prisma.objectSyncRun.findMany({
      ...getPaginationParams<string>(page_size, cursor),
      where: {
        objectSync: {
          connectionId: { in: connectionIds },
          objectType: args.objectType,
          object: args.object,
        },
      },
      include: {
        objectSync: {
          select: {
            id: true,
            connection: true,
          },
        },
      },
      orderBy: {
        startTimestamp: 'desc',
      },
    });
    const countPromise = this.#prisma.objectSyncRun.count({
      where: {
        objectSync: {
          connectionId: { in: connectionIds },
          objectType: args.objectType,
          object: args.object,
        },
      },
    });

    const [models, count] = await Promise.all([modelsPromise, countPromise]);

    const results = models.map(fromObjectSyncRunModelAndSync);

    return {
      ...getPaginationResult<string>(page_size, cursor, results),
      results,
      totalCount: count,
    };
  }
}
