import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import type {
  GetParams,
  ListInternalParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityFilters,
  OpportunityUpdateParams,
  PaginatedResult,
  PaginationParams,
} from '@supaglue/types';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getExpandedAssociations } from '../../lib/expand';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { getRemoteId } from '../../lib/remote_id';
import { fromOpportunityModel, fromRemoteOpportunityToDbOpportunityParams } from '../../mappers';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from './base_service';

export class OpportunityService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  // TODO: implement getParams
  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Opportunity> {
    const { expand } = getParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const model = await this.prisma.crmOpportunity.findUnique({
      where: { id },
      include: {
        account: expandedAssociations.includes('account'),
        owner: expandedAssociations.includes('owner'),
      },
    });
    if (!model) {
      throw new NotFoundError(`Can't find Opportunity with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromOpportunityModel(model, expandedAssociations);
  }

  // TODO: implement rest of list params
  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Opportunity>> {
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
    const models = await this.prisma.crmOpportunity.findMany({
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
        account: expandedAssociations.includes('account'),
        owner: expandedAssociations.includes('owner'),
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromOpportunityModel(model, expandedAssociations));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async search(
    connectionId: string,
    paginationParams: PaginationParams,
    filters: OpportunityFilters
  ): Promise<PaginatedResult<Opportunity>> {
    const { page_size, cursor } = paginationParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.prisma.crmOpportunity.findMany({
      ...getPaginationParams(pageSize, cursor),
      where: {
        connectionId,
        accountId: filters.accountId?.type === 'equals' ? filters.accountId.value : undefined,
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromOpportunityModel(model));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async create(
    customerId: string,
    connectionId: string,
    createParams: OpportunityCreateParams
  ): Promise<Opportunity> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.accountId) {
      remoteCreateParams.accountId = await getRemoteId(createParams.accountId, 'account');
    }
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await getRemoteId(createParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteOpportunity = await remoteClient.createOpportunity(remoteCreateParams);
    const opportunityModel = await this.prisma.crmOpportunity.create({
      data: {
        customerId,
        connectionId,
        ...remoteOpportunity,
        accountId: createParams.accountId,
        ownerId: createParams.ownerId,
      },
    });
    return fromOpportunityModel(opportunityModel);
  }

  public async update(
    customerId: string,
    connectionId: string,
    updateParams: OpportunityUpdateParams
  ): Promise<Opportunity> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundOpportunityModel = await this.prisma.crmOpportunity.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundOpportunityModel.customerId !== customerId) {
      throw new Error('Opportunity customerId does not match');
    }

    const remoteUpdateParams = { ...updateParams };
    if (updateParams.accountId) {
      remoteUpdateParams.accountId = await getRemoteId(updateParams.accountId, 'account');
    }
    if (updateParams.ownerId) {
      remoteUpdateParams.ownerId = await getRemoteId(updateParams.ownerId, 'user');
    }

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteOpportunity = await remoteClient.updateOpportunity({
      ...remoteUpdateParams,
      remoteId: foundOpportunityModel.remoteId,
    });

    const opportunityModel = await this.prisma.crmOpportunity.update({
      data: { ...remoteOpportunity, accountId: updateParams.accountId, ownerId: updateParams.ownerId },
      where: {
        id: updateParams.id,
      },
    });
    return fromOpportunityModel(opportunityModel);
  }

  public async upsertRemoteOpportunities(
    connectionId: string,
    customerId: string,
    remoteOpportunitiesReadable: Readable
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = COMMON_MODEL_DB_TABLES['opportunities'];
    const tempTable = 'crm_opportunities_temp';
    const columnsWithoutId = [
      'remote_id',
      'customer_id',
      'connection_id',
      'name',
      'description',
      'amount',
      'stage',
      'status',
      'pipeline',
      'last_activity_at',
      'close_date',
      'remote_created_at',
      'remote_updated_at',
      'remote_was_deleted',
      'remote_deleted_at',
      'detected_or_remote_deleted_at',
      'last_modified_at',
      '_remote_account_id',
      '_remote_owner_id',
      'updated_at', // TODO: We should have default for this column in Postgres
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteOpportunitiesReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteOpportunityToDbOpportunityParams,
      (remoteOpportunity) =>
        new Date(
          Math.max(
            remoteOpportunity.remoteUpdatedAt?.getTime() || 0,
            remoteOpportunity.detectedOrRemoteDeletedAt?.getTime() || 0
          )
        )
    );
  }

  public async updateDanglingAccounts(connectionId: string): Promise<void> {
    const opportunitiesTable = COMMON_MODEL_DB_TABLES['opportunities'];
    const accountsTable = COMMON_MODEL_DB_TABLES['accounts'];

    await this.prisma.crmOpportunity.updateMany({
      where: {
        remoteAccountId: null,
        accountId: {
          not: null,
        },
      },
      data: {
        accountId: null,
      },
    });

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${opportunitiesTable} o
      SET account_id = a.id
      FROM ${accountsTable} a
      WHERE
        o.connection_id = '${connectionId}'
        AND o.connection_id = a.connection_id
        AND o.account_id IS NULL
        AND o._remote_account_id IS NOT NULL
        AND o._remote_account_id = a.remote_id
      `);
  }

  public async updateDanglingOwners(connectionId: string): Promise<void> {
    const opportunitiesTable = COMMON_MODEL_DB_TABLES['opportunities'];
    const usersTable = COMMON_MODEL_DB_TABLES['users'];

    await this.prisma.crmOpportunity.updateMany({
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
      UPDATE ${opportunitiesTable} c
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
