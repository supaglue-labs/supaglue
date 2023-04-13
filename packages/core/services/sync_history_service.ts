import type { PrismaClient } from '@supaglue/db';
import type {
  PaginatedResult,
  SyncHistory,
  SyncHistoryFilter,
  SyncHistoryStatus,
  SyncHistoryUpsertParams,
} from '@supaglue/types';
import { getCustomerIdPk } from '../lib/customer_id';
import { getPaginationParams, getPaginationResult, IdCursor } from '../lib/pagination';
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
  }: {
    historyId: string;
    status: SyncHistoryStatus;
    errorMessage?: string;
  }): Promise<void> {
    await this.update({
      id: historyId,
      updateParams: {
        status,
        errorMessage: errorMessage ?? null,
        endTimestamp: new Date(),
      },
    });
  }

  public async logStart({
    syncId,
    historyId,
    commonModel,
  }: {
    syncId: string;
    historyId: string;
    commonModel: string;
  }): Promise<string> {
    await this.upsert({
      id: historyId,
      syncId,
      createParams: {
        model: commonModel,
        status: 'IN_PROGRESS',
        errorMessage: null,
        startTimestamp: new Date(),
        endTimestamp: null,
      },
    });
    return historyId;
  }

  public async list({
    applicationId,
    paginationParams,
    model,
    externalCustomerId,
    providerName,
  }: SyncHistoryFilter): Promise<PaginatedResult<SyncHistory>> {
    const customerId = externalCustomerId ? getCustomerIdPk(applicationId, externalCustomerId) : undefined;
    const connections = await this.#connectionService.listSafe(applicationId, customerId, providerName);
    const connectionIds = connections.map(({ id }) => id);
    const { page_size, cursor } = paginationParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.#prisma.syncHistory.findMany({
      ...getPaginationParams<IdCursor>(pageSize, cursor),
      where: {
        sync: {
          connectionId: { in: connectionIds },
        },
        model,
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

    const results = models.map(fromSyncHistoryModelAndSync);

    return {
      ...getPaginationResult<IdCursor>(pageSize, cursor, results),
      results,
    };
  }
}
