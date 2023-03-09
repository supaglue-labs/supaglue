import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { POSTGRES_UPDATE_BATCH_SIZE } from '../../lib/constants';
import { getExpandedAssociations } from '../../lib/expand';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { fromOpportunityModel, fromRemoteOpportunityToDbOpportunityParams } from '../../mappers';
import type {
  GetParams,
  ListParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityUpdateParams,
  PaginatedResult,
} from '../../types';
import { CommonModelBaseService } from './base_service';

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
  public async list(connectionId: string, listParams: ListParams): Promise<PaginatedResult<Opportunity>> {
    const { page_size, cursor, created_after, created_before, updated_after, updated_before, expand } = listParams;
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
        remoteUpdatedAt: {
          gt: updated_after,
          lt: updated_before,
        },
      },
      include: {
        account: expandedAssociations.includes('account'),
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

  private async getAssociatedAccountRemoteId(accountId: string): Promise<string> {
    const crmAccount = await this.prisma.crmAccount.findUnique({
      where: {
        id: accountId,
      },
    });
    if (!crmAccount) {
      throw new NotFoundError(`Account ${accountId} not found`);
    }
    return crmAccount.remoteId;
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
      remoteCreateParams.accountId = await this.getAssociatedAccountRemoteId(createParams.accountId);
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteOpportunity = await remoteClient.createOpportunity(remoteCreateParams);
    const opportunityModel = await this.prisma.crmOpportunity.create({
      data: {
        customerId,
        connectionId,
        ...remoteOpportunity,
        accountId: createParams.accountId,
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
      remoteUpdateParams.accountId = await this.getAssociatedAccountRemoteId(updateParams.accountId);
    }

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteOpportunity = await remoteClient.updateOpportunity({
      ...remoteUpdateParams,
      remoteId: foundOpportunityModel.remoteId,
    });

    const opportunityModel = await this.prisma.crmOpportunity.update({
      data: { ...remoteOpportunity, accountId: updateParams.accountId },
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
  ): Promise<number> {
    // TODO: Shouldn't be hard-coding the DB schema here.
    const table = 'api.crm_opportunities';
    const tempTable = 'crm_opportunities_temp';
    const columnsWithoutId = [
      'remote_id',
      'customer_id',
      'connection_id',
      'remote_was_deleted',
      'owner',
      'name',
      'description',
      'amount',
      'stage',
      'status',
      'last_activity_at',
      'close_date',
      'remote_created_at',
      'remote_updated_at',
      '_remote_account_id',
      'updated_at', // TODO: We should have default for this column in Postgres
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteOpportunitiesReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteOpportunityToDbOpportunityParams
    );
  }

  private async updateDanglingAccountsImpl(
    connectionId: string,
    limit: number,
    cursor?: string
  ): Promise<string | undefined> {
    const opportunitiesWithDanglingAccounts = await this.prisma.crmOpportunity.findMany({
      where: {
        connectionId,
        accountId: null,
        NOT: {
          remoteAccountId: null,
        },
      },
      skip: cursor ? 1 : undefined,
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: 'asc',
      },
    });
    if (!opportunitiesWithDanglingAccounts.length) {
      return;
    }

    const danglingRemoteAccountIds = opportunitiesWithDanglingAccounts.map(
      ({ remoteAccountId }) => remoteAccountId
    ) as string[];
    const crmAccounts = await this.prisma.crmAccount.findMany({
      where: {
        connectionId,
        remoteId: {
          in: danglingRemoteAccountIds,
        },
      },
    });
    await Promise.all(
      crmAccounts.map(({ remoteId, id }) => {
        return this.prisma.crmOpportunity.updateMany({
          where: {
            connectionId,
            remoteAccountId: remoteId,
          },
          data: {
            accountId: id,
          },
        });
      })
    );
    return opportunitiesWithDanglingAccounts[opportunitiesWithDanglingAccounts.length - 1].id;
  }

  public async updateDanglingAccounts(connectionId: string) {
    let cursor = undefined;
    do {
      cursor = await this.updateDanglingAccountsImpl(connectionId, POSTGRES_UPDATE_BATCH_SIZE, cursor);
    } while (cursor);
  }
}
