import type { SyncRunModelExpanded } from '@supaglue/core/types/sync_run';
import type { PrismaClient } from '@supaglue/db';
import type { PaginatedResult } from '@supaglue/types/common';
import type {
  SyncRun,
  SyncRunFilter,
  SyncRunStatus,
  SyncRunUpsertParams,
  SyncRunWithObjectOrEntity,
} from '@supaglue/types/sync_run';
import type { ConnectionService } from '.';
import { getCustomerIdPk } from '../lib/customer_id';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromObjectSyncRunModelAndSyncWithObject, fromSyncRunModelAndSync } from '../mappers/sync_run';

export class SyncRunService {
  #prisma: PrismaClient;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#connectionService = connectionService;
  }

  async #upsert({
    id,
    syncId,
    connectionId,
    createParams,
  }: {
    id: string;
    syncId: string;
    connectionId: string;
    createParams: SyncRunUpsertParams;
  }): Promise<SyncRun> {
    const created: SyncRunModelExpanded = await this.#prisma.syncRun.upsert({
      where: { id },
      create: {
        ...createParams,
        id,
        syncId,
        connectionId,
      },
      update: {},

      // TODO: drop after denormalization migration
      include: {
        sync: {
          select: {
            id: true,
            connection: true,
          },
        },
      },
    });

    return fromSyncRunModelAndSync(created);
  }

  async #update({ id, updateParams }: { id: string; updateParams: Partial<SyncRunUpsertParams> }): Promise<SyncRun> {
    const model = await this.#prisma.syncRun.update({
      where: { id },
      data: updateParams,

      // TODO: drop after denormalization migration
      include: {
        sync: {
          select: {
            id: true,
            connection: true,
          },
        },
      },
    });

    return fromSyncRunModelAndSync(model);
  }

  public async logStart(args: { syncId: string; runId: string; connectionId: string }): Promise<string> {
    await this.#upsert({
      id: args.runId,
      syncId: args.syncId,
      connectionId: args.connectionId,
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
    type,
    objectType,
    object,
    entityId,
  }: {
    runId: string;
    status: SyncRunStatus;
    errorMessage?: string;
    numRecordsSynced: number | null;

    // Note: loose types for object vs entity
    type?: string;
    objectType?: string;
    object?: string;
    entityId?: string;
  }): Promise<void> {
    await this.#update({
      id: runId,
      updateParams: {
        status,
        errorMessage: errorMessage ?? null,
        endTimestamp: new Date(),
        numRecordsSynced,
        syncType: type,
        objectType,
        object,
        entityId,
      },
    });
  }

  public async list(args: SyncRunFilter): Promise<PaginatedResult<SyncRunWithObjectOrEntity>> {
    // TODO: add prisma column
    const { applicationId, paginationParams, externalCustomerId, providerName } = args;
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const connectionIds = connections.map(({ id }) => id);
    const { page_size, cursor } = paginationParams;
    const whereClause = {
      sync: {
        connectionId: { in: connectionIds },
        objectType: 'objectType' in args ? args.objectType : undefined,
        object: 'object' in args ? args.object : undefined,
        entityId: 'entityId' in args ? args.entityId : undefined,
      },
      startTimestamp: 'startTimestamp' in args ? args.startTimestamp : undefined,
      endTimestamp: 'endTimestamp' in args ? args.endTimestamp : undefined,
      status: 'status' in args ? args.status : undefined,
    };
    const modelsPromise = this.#prisma.syncRun.findMany({
      ...getPaginationParams<string>(page_size, cursor),
      where: whereClause,

      // TODO: drop after denormalization migration
      include: {
        sync: {
          select: {
            id: true,
            type: true,
            objectType: true,
            object: true,
            entityId: true,
            connection: true,
          },
        },
      },
      orderBy: {
        startTimestamp: 'desc',
      },
    });
    // NOTE: this query is slow (10s+). revisit optimizing the query or pushing the counting work to be done at "write" time to avoid querying for it.
    // const countPromise = this.#prisma.syncRun.count({
    //   where: whereClause,
    // });

    const [models] = await Promise.all([modelsPromise]);

    const results = models.map(fromObjectSyncRunModelAndSyncWithObject);

    return {
      ...getPaginationResult<string>(page_size, cursor, results),
      results,
      totalCount: Number.MAX_SAFE_INTEGER,
    };
  }
}
