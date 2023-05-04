import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import type {
  GetInternalParams,
  ListInternalParams,
  Opportunity,
  OpportunityCreateParams,
  OpportunityFilters,
  OpportunityUpdateParams,
  PaginatedResult,
  SearchInternalParams,
} from '@supaglue/types';
import { Readable } from 'stream';
import { v5 as uuidv5 } from 'uuid';
import { CommonModelBaseService, getLastModifiedAt, UpsertRemoteCommonModelsResult } from '..';
import { NotFoundError, UnauthorizedError } from '../../../errors';
import { getPaginationParams, getPaginationResult, getRemoteId } from '../../../lib';
import { fromOpportunityModel, fromRemoteOpportunityToDbOpportunityParams } from '../../../mappers';
import { CrmRemoteClient } from '../../../remotes/crm/base';

export class OpportunityService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetInternalParams): Promise<Opportunity> {
    const model = await this.prisma.crmOpportunity.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find Opportunity with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromOpportunityModel(model, getParams);
  }

  // TODO: implement rest of list params
  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Opportunity>> {
    const { page_size, cursor, include_deleted_data, created_after, created_before, modified_after, modified_before } =
      listParams;
    const models = await this.prisma.crmOpportunity.findMany({
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
    const results = models.map((model) => fromOpportunityModel(model, listParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
      results,
    };
  }

  public async search(
    connectionId: string,
    searchParams: SearchInternalParams,
    filters: OpportunityFilters
  ): Promise<PaginatedResult<Opportunity>> {
    const { page_size, cursor } = searchParams;
    const models = await this.prisma.crmOpportunity.findMany({
      ...getPaginationParams(page_size, cursor),
      where: {
        connectionId,
        accountId: filters.accountId?.type === 'equals' ? filters.accountId.value : undefined,
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromOpportunityModel(model, searchParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
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
      remoteCreateParams.accountId = await getRemoteId(this.prisma, createParams.accountId, 'account');
    }
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await getRemoteId(this.prisma, createParams.ownerId, 'user');
    }
    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    const remoteOpportunity = await remoteClient.createObject('opportunity', remoteCreateParams);
    const opportunityModel = await this.prisma.crmOpportunity.create({
      data: {
        id: uuidv5(remoteOpportunity.remoteId, connectionId),
        customerId,
        connectionId,
        lastModifiedAt: getLastModifiedAt(remoteOpportunity),
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
      remoteUpdateParams.accountId = await getRemoteId(this.prisma, updateParams.accountId, 'account');
    }
    if (updateParams.ownerId) {
      remoteUpdateParams.ownerId = await getRemoteId(this.prisma, updateParams.ownerId, 'user');
    }

    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    const remoteOpportunity = await remoteClient.updateObject('opportunity', {
      ...remoteUpdateParams,
      remoteId: foundOpportunityModel.remoteId,
    });

    const opportunityModel = await this.prisma.crmOpportunity.update({
      data: {
        ...remoteOpportunity,
        lastModifiedAt: getLastModifiedAt(remoteOpportunity),
        accountId: updateParams.accountId,
        ownerId: updateParams.ownerId,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromOpportunityModel(opportunityModel);
  }

  public async upsertRemoteOpportunities(
    connectionId: string,
    customerId: string,
    remoteOpportunitiesReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = COMMON_MODEL_DB_TABLES.crm.opportunities;
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
      'account_id',
      '_remote_owner_id',
      'owner_id',
      'updated_at', // TODO: We should have default for this column in Postgres
      'raw_data',
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteOpportunitiesReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteOpportunityToDbOpportunityParams,
      onUpsertBatchCompletion
    );
  }
}
