import type { EntitySyncRunModelExpanded } from '@supaglue/core/types/entity_sync_run';
import type { PrismaClient } from '@supaglue/db';
import type { PaginatedResult } from '@supaglue/types/common';
import type {
  EntitySyncRun,
  EntitySyncRunFilter,
  EntitySyncRunStatus,
  EntitySyncRunUpsertParams,
  EntitySyncRunWithEntity,
} from '@supaglue/types/entity_sync_run';
import type { ConnectionService } from '.';
import { getCustomerIdPk } from '../lib/customer_id';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromEntitySyncRunModelAndSync, fromEntitySyncRunModelAndSyncWithEntity } from '../mappers/entity_sync_run';

export class EntitySyncRunService {
  #prisma: PrismaClient;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#connectionService = connectionService;
  }

  async #upsert({
    id,
    entitySyncId,
    createParams,
  }: {
    id: string;
    entitySyncId: string;
    createParams: EntitySyncRunUpsertParams;
  }): Promise<EntitySyncRun> {
    const created: EntitySyncRunModelExpanded = await this.#prisma.entitySyncRun.upsert({
      where: { id },
      create: {
        ...createParams,
        id,
        entitySyncId,
      },
      update: {},
      include: {
        entitySync: {
          select: {
            id: true,
            connection: true,
          },
        },
      },
    });

    return fromEntitySyncRunModelAndSync(created);
  }

  async #update({
    id,
    updateParams,
  }: {
    id: string;
    updateParams: Partial<EntitySyncRunUpsertParams>;
  }): Promise<EntitySyncRun> {
    const model = await this.#prisma.entitySyncRun.update({
      where: { id },
      data: updateParams,
      include: {
        entitySync: {
          select: {
            id: true,
            connection: true,
          },
        },
      },
    });

    return fromEntitySyncRunModelAndSync(model);
  }

  public async logStart(args: { entitySyncId: string; runId: string }): Promise<string> {
    await this.#upsert({
      id: args.runId,
      entitySyncId: args.entitySyncId,
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
    status: EntitySyncRunStatus;
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

  public async list(args: EntitySyncRunFilter): Promise<PaginatedResult<EntitySyncRunWithEntity>> {
    // TODO: add prisma column
    const { applicationId, paginationParams, externalCustomerId, providerName } = args;
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const connectionIds = connections.map(({ id }) => id);
    const { page_size, cursor } = paginationParams;
    const modelsPromise = this.#prisma.entitySyncRun.findMany({
      ...getPaginationParams<string>(page_size, cursor),
      where: {
        entitySync: {
          connectionId: { in: connectionIds },
          entityId: args.entityId,
        },
      },
      include: {
        entitySync: {
          select: {
            id: true,
            entityId: true,
            connection: true,
          },
        },
      },
      orderBy: {
        startTimestamp: 'desc',
      },
    });
    const countPromise = this.#prisma.entitySyncRun.count({
      where: {
        entitySync: {
          connectionId: { in: connectionIds },
          entityId: args.entityId,
        },
      },
    });

    const [models, count] = await Promise.all([modelsPromise, countPromise]);

    const results = models.map(fromEntitySyncRunModelAndSyncWithEntity);

    return {
      ...getPaginationResult<string>(page_size, cursor, results),
      results,
      totalCount: count,
    };
  }
}
