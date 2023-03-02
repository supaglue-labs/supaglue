import type { PrismaClient } from '@supaglue/db';
import { NotFoundError, UnauthorizedError } from '../errors';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { refreshAccessTokenIfNecessary } from '../lib/refresh_token';
import { fromAccountModel } from '../mappers';
import type {
  Account,
  AccountCreateParams,
  AccountSyncUpsertParams,
  AccountUpdateParams,
  GetParams,
  ListParams,
  PaginatedResult,
} from '../types';
import type { ConnectionService } from './connection_service';
import type { RemoteService } from './remote_service';

export class AccountService {
  #prisma: PrismaClient;
  #remoteService: RemoteService;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, remoteService: RemoteService, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#remoteService = remoteService;
    this.#connectionService = connectionService;
  }

  // TODO: implement getParams
  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Account> {
    const model = await this.#prisma.crmAccount.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find account with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromAccountModel(model);
  }

  // TODO: implement rest of list params
  public async list(connectionId: string, listParams: ListParams): Promise<PaginatedResult<Account>> {
    const { page_size, cursor, created_after, created_before, updated_after, updated_before } = listParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.#prisma.crmAccount.findMany({
      ...getPaginationParams(pageSize, cursor),
      where: {
        connectionId,
        remoteCreatedAt: {
          gt: created_after,
          lt: created_before,
        },
        remoteUpdatedAt: {
          gt: updated_after,
          lt: updated_before,
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map(fromAccountModel);
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async create(customerId: string, connectionId: string, createParams: AccountCreateParams): Promise<Account> {
    // TODO: We may want to have better guarantees that we create the record in both our DB
    // and the external integration.
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    await refreshAccessTokenIfNecessary(connectionId, remoteClient, this.#connectionService);
    const remoteAccount = await remoteClient.createAccount(createParams);
    const accountModel = await this.#prisma.crmAccount.create({
      data: {
        customerId,
        connectionId,
        ...remoteAccount,
      },
    });
    return fromAccountModel(accountModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: AccountUpdateParams): Promise<Account> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundAccountModel = await this.#prisma.crmAccount.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundAccountModel.customerId !== customerId) {
      throw new Error('Account customerId does not match');
    }

    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    await refreshAccessTokenIfNecessary(connectionId, remoteClient, this.#connectionService);
    const remoteAccount = await remoteClient.updateAccount({
      ...updateParams,
      remoteId: foundAccountModel.remoteId,
    });

    const accountModel = await this.#prisma.crmAccount.update({
      data: remoteAccount,
      where: {
        id: updateParams.id,
      },
    });
    return fromAccountModel(accountModel);
  }

  // TODO: We should do this performantly, which may involve COPY to temp table
  // and bulk upsert from there.
  public async upsertRemoteAccounts(connectionId: string, upsertParamsList: AccountSyncUpsertParams[]): Promise<void> {
    for (const upsertParams of upsertParamsList) {
      await this.#prisma.crmAccount.upsert({
        where: {
          connectionId_remoteId: {
            connectionId,
            remoteId: upsertParams.remoteId,
          },
        },
        update: upsertParams,
        create: upsertParams,
      });
    }
  }
}
