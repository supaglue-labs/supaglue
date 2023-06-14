import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import type { GetInternalParams, ListInternalParams, PaginatedResult, SearchInternalParams } from '@supaglue/types';
import { Account, AccountCreateParams, AccountFilters, AccountUpdateParams } from '@supaglue/types/crm';
import { Readable } from 'stream';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from '..';
import { NotFoundError } from '../../../errors';
import { getPaginationParams, getPaginationResult, getRemoteId } from '../../../lib';
import { getWhereClauseForFilter } from '../../../lib/filter';
import { fromAccountModel, fromRemoteAccountToDbAccountParams, fromRemoteAccountToModel } from '../../../mappers/crm';
import { CrmRemoteClient } from '../../../remotes/crm/base';

export class AccountService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetInternalParams): Promise<Account> {
    const model = await this.prisma.crmAccount.findUnique({
      where: { id },
    });
    if (!model || model.connectionId !== connectionId) {
      throw new NotFoundError(`Can't find account with id: ${id}`);
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
        website: getWhereClauseForFilter(filters.website),
        remoteId: filters.remoteId?.type === 'equals' ? filters.remoteId.value : undefined,
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
    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    const id = await remoteClient.createCommonModelRecord('account', remoteCreateParams);
    const remoteAccount = await remoteClient.getCommonModelRecord('account', id);
    const accountModel = await this.prisma.crmAccount.create({
      data: fromRemoteAccountToModel(connectionId, customerId, remoteAccount),
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

    if (foundAccountModel.customerId !== customerId || foundAccountModel.connectionId !== connectionId) {
      throw new NotFoundError('Account not found');
    }

    const remoteUpdateParams = { ...updateParams };
    if (updateParams.ownerId) {
      remoteUpdateParams.ownerId = await getRemoteId(this.prisma, updateParams.ownerId, 'user');
    }
    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    const returnedId = await remoteClient.updateCommonModelRecord('account', {
      ...remoteUpdateParams,
      id: foundAccountModel.remoteId,
    });
    const remoteAccount = await remoteClient.getCommonModelRecord('account', returnedId);

    // This can happen for hubspot if 2 records got merged. In this case, we should update both.
    if (foundAccountModel.remoteId !== returnedId) {
      await this.prisma.crmAccount.updateMany({
        where: {
          remoteId: {
            in: [foundAccountModel.remoteId, returnedId],
          },
          connectionId: foundAccountModel.connectionId,
        },
        data: {
          ...fromRemoteAccountToModel(connectionId, customerId, remoteAccount),
          id: undefined,
          remoteId: undefined,
          ownerId: updateParams.ownerId,
        },
      });
      return await this.getById(updateParams.id, connectionId, {});
    }

    const accountModel = await this.prisma.crmAccount.update({
      data: {
        ...fromRemoteAccountToModel(connectionId, customerId, remoteAccount),
        ownerId: updateParams.ownerId,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromAccountModel(accountModel);
  }

  public async upsertRemoteRecords(
    connectionId: string,
    customerId: string,
    remoteRecordsReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = COMMON_MODEL_DB_TABLES.crm.accounts;
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
      remoteRecordsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteAccountToDbAccountParams,
      onUpsertBatchCompletion
    );
  }
}
