import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { fromAccountModel, fromRemoteAccountToDbAccountParams } from '../../mappers/index';
import type {
  Account,
  AccountCreateParams,
  AccountUpdateParams,
  GetParams,
  ListParams,
  PaginatedResult,
} from '../../types/index';
import { CommonModelBaseService } from './base_service';

export class AccountService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  // TODO: implement getParams
  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Account> {
    const model = await this.prisma.crmAccount.findUnique({
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
    const models = await this.prisma.crmAccount.findMany({
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
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.createAccount(createParams);
    const accountModel = await this.prisma.crmAccount.create({
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
    const foundAccountModel = await this.prisma.crmAccount.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundAccountModel.customerId !== customerId) {
      throw new Error('Account customerId does not match');
    }

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.updateAccount({
      ...updateParams,
      remoteId: foundAccountModel.remoteId,
    });

    const accountModel = await this.prisma.crmAccount.update({
      data: remoteAccount,
      where: {
        id: updateParams.id,
      },
    });
    return fromAccountModel(accountModel);
  }

  public async upsertRemoteAccounts(
    connectionId: string,
    customerId: string,
    remoteAccountsReadable: Readable
  ): Promise<void> {
    // TODO: Shouldn't be hard-coding the DB schema here.
    const table = 'api.crm_accounts';
    const tempTable = 'crm_accounts_temp';
    const columnsWithoutId = [
      'owner',
      'name',
      'description',
      'industry',
      'website',
      'number_of_employees',
      'addresses',
      'phone_numbers',
      'last_activity_at',
      'remote_id',
      'remote_created_at',
      'remote_updated_at',
      'remote_was_deleted',
      'customer_id',
      'connection_id',
      'updated_at', // TODO: We should have default for this column in Postgres
    ];

    await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteAccountsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteAccountToDbAccountParams
    );
  }
}
