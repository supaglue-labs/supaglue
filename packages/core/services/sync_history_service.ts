import type { PrismaClient } from '@supaglue/db';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromSyncHistoryModel } from '../mappers';
import type { PaginatedResult, PaginationParams, SyncHistory, SyncHistoryCreateParams } from '../types';

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
    // TODO casting to any here because prisma isn't typing the model with the included connection correctly
    const models: any[] = await this.#prisma.syncHistory.findMany({
      // TODO casting to any here because our pagination system expects id to be a string, but is a number here
      ...(getPaginationParams(pageSize, cursor) as any),
      where: {
        connectionId,
        model,
      },
      include: {
        connection: true,
      },
      orderBy: {
        id: 'desc',
      },
    });

    const results = models.map(fromSyncHistoryModel);

    return {
      // TODO casting to any here because our pagination system expects id to be a string, but is a number here
      ...getPaginationResult(pageSize, cursor, results as any),
      results,
    };
  }
}
