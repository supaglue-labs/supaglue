import { COMMON_MODEL_DB_TABLES, schemaPrefix } from '@supaglue/db';
import type {
  Account,
  AccountCreateParams,
  AccountFilters,
  AccountUpdateParams,
  GetParams,
  ListInternalParams,
  PaginatedResult,
  PaginationParams,
} from '@supaglue/types';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getExpandedAssociations } from '../../lib/expand';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { getRemoteId } from '../../lib/remote_id';
import { fromAccountModel, fromRemoteAccountToDbAccountParams } from '../../mappers/index';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from './base_service';

export class AccountService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  // TODO: implement getParams
  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Account> {
    const { expand } = getParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const model = await this.prisma.crmAccount.findUnique({
      where: { id },
      include: {
        owner: expandedAssociations.includes('owner'),
      },
    });
    if (!model) {
      throw new NotFoundError(`Can't find account with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromAccountModel(model, expandedAssociations);
  }

  public async search(
    connectionId: string,
    paginationParams: PaginationParams,
    filters: AccountFilters
  ): Promise<PaginatedResult<Account>> {
    const { page_size, cursor } = paginationParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.prisma.crmAccount.findMany({
      ...getPaginationParams(pageSize, cursor),
      where: {
        connectionId,
        website: filters.website?.type === 'equals' ? filters.website.value : undefined,
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromAccountModel(model));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  // TODO: implement rest of list params
  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Account>> {
    const {
      page_size,
      cursor,
      include_deleted_data,
      created_after,
      created_before,
      modified_after,
      modified_before,
      expand,
    } = listParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.prisma.crmAccount.findMany({
      ...getPaginationParams(pageSize, cursor),
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
      include: {
        owner: expandedAssociations.includes('owner'),
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromAccountModel(model, expandedAssociations));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async create(customerId: string, connectionId: string, createParams: AccountCreateParams): Promise<Account> {
    // TODO: We may want to have better guarantees that we create the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await getRemoteId(createParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.createAccount(remoteCreateParams);
    const accountModel = await this.prisma.crmAccount.create({
      data: {
        customerId,
        connectionId,
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
      remoteUpdateParams.ownerId = await getRemoteId(updateParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.updateAccount({
      ...remoteUpdateParams,
      remoteId: foundAccountModel.remoteId,
    });

    const accountModel = await this.prisma.crmAccount.update({
      data: { ...remoteAccount, ownerId: updateParams.ownerId },
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
      'updated_at', // TODO: We should have default for this column in Postgres
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteAccountsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteAccountToDbAccountParams,
      (remoteAccount) =>
        new Date(
          Math.max(
            remoteAccount.remoteUpdatedAt?.getTime() || 0,
            remoteAccount.detectedOrRemoteDeletedAt?.getTime() || 0
          )
        )
    );
  }

  public async updateDanglingOwners(connectionId: string): Promise<void> {
    const accountsTable = COMMON_MODEL_DB_TABLES['accounts'];
    const usersTable = COMMON_MODEL_DB_TABLES['users'];

    await this.prisma.crmAccount.updateMany({
      where: {
        remoteOwnerId: null,
        ownerId: {
          not: null,
        },
      },
      data: {
        ownerId: null,
      },
    });

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${accountsTable} c
      SET owner_id = u.id
      FROM ${usersTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.connection_id = u.connection_id
        AND c.owner_id IS NULL
        AND c._remote_owner_id IS NOT NULL
        AND c._remote_owner_id = u.remote_id
      `);
  }
}
