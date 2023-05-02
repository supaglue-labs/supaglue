import { schemaPrefix } from '@supaglue/db';
import type {
  Account,
  AccountCreateParams,
  AccountFilters,
  AccountUpdateParams,
  GetInternalParams,
  ListInternalParams,
  PaginatedResult,
  SearchInternalParams,
} from '@supaglue/types';
import { Readable } from 'stream';
import { v5 as uuidv5 } from 'uuid';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { getRemoteId } from '../../lib/remote_id';
import { fromAccountModel, fromRemoteAccountToDbAccountParams } from '../../mappers/index';
import { CommonModelBaseService, getLastModifiedAt, UpsertRemoteCommonModelsResult } from './base_service';

export class AccountService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetInternalParams): Promise<Account> {
    const model = await this.prisma.crmAccount.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find account with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromAccountModel(model, getParams);
  }

  public async search(
    connectionId: string,
    searchParams: SearchInternalParams,
    filters: AccountFilters
  ): Promise<PaginatedResult<Account>> {
    const { page_size, cursor } = searchParams;
    const models = await this.prisma.crmAccount.findMany({
      ...getPaginationParams(page_size, cursor),
      where: {
        connectionId,
        website: filters.website?.type === 'equals' ? filters.website.value : undefined,
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromAccountModel(model, searchParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
      results,
    };
  }

  // TODO: implement rest of list params
  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Account>> {
    const { page_size, cursor, include_deleted_data, created_after, created_before, modified_after, modified_before } =
      listParams;
    const models = await this.prisma.crmAccount.findMany({
      ...getPaginationParams(page_size, cursor),
      where: {
        connectionId,
        remoteCreatedAt: {
          gt: created_after,
          lt: created_before,
        },
        lastModifiedAt: {
          gt: modified_after,
          lt: modified_before,
        },
        remoteWasDeleted: include_deleted_data ? undefined : false,
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromAccountModel(model, listParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
      results,
    };
  }

  public async create(customerId: string, connectionId: string, createParams: AccountCreateParams): Promise<Account> {
    // TODO: We may want to have better guarantees that we create the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await getRemoteId(this.prisma, createParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.createAccount(remoteCreateParams);
    const accountModel = await this.prisma.crmAccount.create({
      data: {
        id: uuidv5(remoteAccount.remoteId, connectionId),
        customerId,
        connectionId,
        lastModifiedAt: getLastModifiedAt(remoteAccount),
        ...remoteAccount,
        ownerId: createParams.ownerId,
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

    const remoteUpdateParams = { ...updateParams };
    if (updateParams.ownerId) {
      remoteUpdateParams.ownerId = await getRemoteId(this.prisma, updateParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.updateAccount({
      ...remoteUpdateParams,
      remoteId: foundAccountModel.remoteId,
    });

    const accountModel = await this.prisma.crmAccount.update({
      data: {
        ...remoteAccount,
        lastModifiedAt: getLastModifiedAt(remoteAccount),
        ownerId: updateParams.ownerId,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromAccountModel(accountModel);
  }

  public async upsertRemoteAccounts(
    connectionId: string,
    customerId: string,
    remoteAccountsReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = `${schemaPrefix}crm_accounts`;
    const tempTable = 'crm_accounts_temp';
    const columnsWithoutId = [
      'name',
      'description',
      'industry',
      'website',
      'number_of_employees',
      'addresses',
      'phone_numbers',
      'last_activity_at',
      'lifecycle_stage',
      'remote_id',
      'remote_created_at',
      'remote_updated_at',
      'remote_was_deleted',
      'remote_deleted_at',
      'detected_or_remote_deleted_at',
      'last_modified_at',
      'customer_id',
      'connection_id',
      '_remote_owner_id',
      'owner_id',
      'updated_at', // TODO: We should have default for this column in Postgres
      'raw_data',
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteAccountsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteAccountToDbAccountParams,
      onUpsertBatchCompletion
    );
  }
}
