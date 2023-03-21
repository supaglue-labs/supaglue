import type { PrismaClient } from '@supaglue/db';
import { getCustomerIdPk } from '../lib/customer_id';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromSyncHistoryModelAndConnection } from '../mappers';
import type {
  PaginatedResult,
  SyncHistory,
  SyncHistoryCreateParams,
  SyncHistoryFilter,
  SyncHistoryModelExpanded,
  SyncHistoryStatus,
} from '../types';
import { ConnectionService } from './connection_service';

export class SyncHistoryService {
  #prisma: PrismaClient;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#connectionService = connectionService;
  }

  public async create({
    connectionId,
    createParams,
  }: {
    connectionId: string;
    createParams: SyncHistoryCreateParams;
  }): Promise<SyncHistory> {
    const created: SyncHistoryModelExpanded = await this.#prisma.syncHistory.create({
      data: {
        ...createParams,
        connectionId,
      },
      include: {
        connection: true,
      },
    });

    return fromSyncHistoryModelAndConnection(created);
  }

  public async update({
    id,
    updateParams,
  }: {
    id: number;
    updateParams: Partial<SyncHistoryCreateParams>;
  }): Promise<SyncHistory> {
    const model = await this.#prisma.syncHistory.update({
      where: { id },
      data: updateParams,
      include: {
        connection: true,
      },
    });

    return fromSyncHistoryModelAndConnection(model);
  }

  public async logFinish({
    historyId,
    status,
    errorMessage,
  }: {
    historyId: number;
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

  public async logStart({ connectionId, commonModel }: { connectionId: string; commonModel: string }): Promise<number> {
    const { id } = await this.create({
      connectionId,
      createParams: {
        model: commonModel,
        status: 'IN_PROGRESS',
        errorMessage: null,
        startTimestamp: new Date(),
        endTimestamp: null,
      },
    });
    return id;
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
      ...getPaginationParams<number>(pageSize, cursor),
      where: {
        connectionId: { in: connectionIds },
        model,
      },
      include: {
        connection: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const results = models.map(fromSyncHistoryModelAndConnection);

    return {
      ...getPaginationResult<number>(pageSize, cursor, results),
      results,
    };
  }
}
