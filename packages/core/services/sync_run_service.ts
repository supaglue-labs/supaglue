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
    createParams,
  }: {
    id: string;
    syncId: string;
    createParams: SyncRunUpsertParams;
  }): Promise<SyncRun> {
    const created: SyncRunModelExpanded = await this.#prisma.syncRun.upsert({
      where: { id },
      create: {
        ...createParams,
        id,
        syncId,
      },
      update: {},
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

  public async logStart(args: { syncId: string; runId: string }): Promise<string> {
    await this.#upsert({
      id: args.runId,
      syncId: args.syncId,
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
    status: SyncRunStatus;
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

  public async list(args: SyncRunFilter): Promise<PaginatedResult<SyncRunWithObjectOrEntity>> {
    // TODO: add prisma column
    const { applicationId, paginationParams, externalCustomerId, providerName } = args;
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const connectionIds = connections.map(({ id }) => id);
    const { page_size, cursor } = paginationParams;
    const modelsPromise = this.#prisma.syncRun.findMany({
      ...getPaginationParams<string>(page_size, cursor),
      where: {
        sync: {
          connectionId: { in: connectionIds },
          objectType: {
            equals: 'objectType' in args ? args.objectType : undefined,
            mode: 'insensitive',
          },
          object: {
            equals: 'object' in args ? args.object : undefined,
            mode: 'insensitive',
          },
          entityId: 'entityId' in args ? args.entityId : undefined,
        },
      },
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
    const countPromise = this.#prisma.syncRun.count({
      where: {
        sync: {
          connectionId: { in: connectionIds },
          objectType: 'objectType' in args ? args.objectType : undefined,
          object: 'object' in args ? args.object : undefined,
          entityId: 'entityId' in args ? args.entityId : undefined,
        },
      },
    });

    const [models, count] = await Promise.all([modelsPromise, countPromise]);

    const results = models.map(fromObjectSyncRunModelAndSyncWithObject);

    return {
      ...getPaginationResult<string>(page_size, cursor, results),
      results,
      totalCount: count,
    };
  }
}
