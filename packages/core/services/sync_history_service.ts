import type { PrismaClient } from '@supaglue/db';
import type {
  PaginatedResult,
  SyncHistory,
  SyncHistoryFilter,
  SyncHistoryStatus,
  SyncHistoryUpsertParams,
} from '@supaglue/types';
import { getCustomerIdPk } from '../lib/customer_id';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromSyncHistoryModelAndSync } from '../mappers';
import { SyncHistoryModelExpanded } from '../types/sync_history';
import { ConnectionService } from './connection_service';

export class SyncHistoryService {
  #prisma: PrismaClient;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#connectionService = connectionService;
  }

  public async upsert({
    id,
    syncId,
    createParams,
  }: {
    id: string;
    syncId: string;
    createParams: SyncHistoryUpsertParams;
  }): Promise<SyncHistory> {
    const created: SyncHistoryModelExpanded = await this.#prisma.syncHistory.upsert({
      where: { id },
      // TODO: add prisma column
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

    return fromSyncHistoryModelAndSync(created);
  }

  public async update({
    id,
    updateParams,
  }: {
    id: string;
    updateParams: Partial<SyncHistoryUpsertParams>;
  }): Promise<SyncHistory> {
    const model = await this.#prisma.syncHistory.update({
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

    return fromSyncHistoryModelAndSync(model);
  }

  public async logFinish({
    historyId,
    status,
    errorMessage,
    numRecordsSynced,
  }: {
    historyId: string;
    status: SyncHistoryStatus;
    errorMessage?: string;
    numRecordsSynced: number | null;
  }): Promise<void> {
    await this.update({
      id: historyId,
      updateParams: {
        status,
        errorMessage: errorMessage ?? null,
        endTimestamp: new Date(),
        numRecordsSynced,
      },
    });
  }

  public async logStart(
    args: {
      syncId: string;
      historyId: string;
    } & (
      | {
          commonModel: string;
        }
      | {
          rawObject: string;
        }
    )
  ): Promise<string> {
    const baseParams = {
      status: 'IN_PROGRESS' as const,
      errorMessage: null,
      startTimestamp: new Date(),
      endTimestamp: null,
      numRecordsSynced: null,
    };
    await this.upsert({
      id: args.historyId,
      syncId: args.syncId,
      createParams:
        'commonModel' in args
          ? { ...baseParams, model: args.commonModel }
          : { ...baseParams, rawObject: args.rawObject },
    });
    return args.historyId;
  }

  public async list(args: SyncHistoryFilter): Promise<PaginatedResult<SyncHistory>> {
    // TODO: add prisma column
    const { applicationId, paginationParams, externalCustomerId, providerName } = args;
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const connectionIds = connections.map(({ id }) => id);
    const { page_size, cursor } = paginationParams;
    const modelsPromise = this.#prisma.syncHistory.findMany({
      ...getPaginationParams<string>(page_size, cursor),
      where: {
        sync: {
          connectionId: { in: connectionIds },
        },
        model: 'model' in args ? args.model : undefined,
        rawObject: 'rawObject' in args ? args.rawObject : undefined,
      },
      include: {
        sync: {
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
    const countPromise = this.#prisma.syncHistory.count({
      where: {
        sync: {
          connectionId: { in: connectionIds },
        },
        model: 'model' in args ? args.model : undefined,
        rawObject: 'rawObject' in args ? args.rawObject : undefined,
      },
    });

    const [models, count] = await Promise.all([modelsPromise, countPromise]);

    const results = models.map(fromSyncHistoryModelAndSync);

    return {
      ...getPaginationResult<string>(page_size, cursor, results),
      results,
      totalCount: count,
    };
  }
}
