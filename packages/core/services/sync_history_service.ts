import type { PrismaClient } from '@supaglue/db';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromSyncHistoryModel } from '../mappers';
import type {
  PaginatedResult,
  PaginationParams,
  SyncHistory,
  SyncHistoryCreateParams,
  SyncHistoryStatus,
} from '../types';

export class SyncHistoryService {
  #prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma;
  }

  public async create({
    connectionId,
    createParams,
  }: {
    connectionId: string;
    createParams: SyncHistoryCreateParams;
  }): Promise<SyncHistory> {
    const created = await this.#prisma.syncHistory.create({
      data: {
        ...createParams,
        connectionId,
      },
      include: {
        connection: true,
      },
    });

    return fromSyncHistoryModel(created);
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

    return fromSyncHistoryModel(model);
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
    connectionId,
    paginationParams,
    model,
  }: {
    connectionId: string;
    paginationParams: PaginationParams;
    model?: string;
  }): Promise<PaginatedResult<SyncHistory>> {
    const { page_size, cursor } = paginationParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models: any[] = await this.#prisma.syncHistory.findMany({
      ...getPaginationParams<number>(pageSize, cursor),
      where: {
        connectionId,
        model,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const results = models.map(fromSyncHistoryModel);

    return {
      ...getPaginationResult<number>(pageSize, cursor, results),
      results,
    };
  }
}
