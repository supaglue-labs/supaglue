import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import type { GetInternalParams, ListInternalParams, PaginatedResult, SearchInternalParams } from '@supaglue/types';
import { Lead, LeadCreateParams, LeadFilters, LeadUpdateParams } from '@supaglue/types/crm';
import { Readable } from 'stream';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from '..';
import { NotFoundError, UnauthorizedError } from '../../../errors';
import { getPaginationParams, getPaginationResult, getRemoteId } from '../../../lib';
import { fromLeadModel, fromRemoteLeadToDbLeadParams, fromRemoteLeadToModel } from '../../../mappers/crm';
import { CrmRemoteClient } from '../../../remotes/crm/base';

export class LeadService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetInternalParams): Promise<Lead> {
    const model = await this.prisma.crmLead.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find Lead with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromLeadModel(model, getParams);
  }

  public async search(
    connectionId: string,
    searchParams: SearchInternalParams,
    filters: LeadFilters
  ): Promise<PaginatedResult<Lead>> {
    const { page_size, cursor } = searchParams;
    const models = await this.prisma.crmLead.findMany({
      ...getPaginationParams(page_size, cursor),
      where: {
        connectionId,
        emailAddresses:
          filters.emailAddress?.type === 'equals'
            ? {
                array_contains: [{ emailAddress: filters.emailAddress.value }],
              }
            : undefined,
        remoteId: filters.remoteId?.type === 'equals' ? filters.remoteId.value : undefined,
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromLeadModel(model, searchParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
      results,
    };
  }

  // TODO: implement rest of list params
  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Lead>> {
    const { page_size, cursor, include_deleted_data, created_after, created_before, modified_after, modified_before } =
      listParams;
    const models = await this.prisma.crmLead.findMany({
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
    const results = models.map((model) => fromLeadModel(model, listParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
      results,
    };
  }

  public async create(customerId: string, connectionId: string, createParams: LeadCreateParams): Promise<Lead> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await getRemoteId(this.prisma, createParams.ownerId, 'user');
    }
    if (createParams.convertedAccountId) {
      remoteCreateParams.convertedAccountId = await getRemoteId(
        this.prisma,
        createParams.convertedAccountId,
        'account'
      );
    }
    if (createParams.convertedContactId) {
      remoteCreateParams.convertedContactId = await getRemoteId(
        this.prisma,
        createParams.convertedContactId,
        'contact'
      );
    }
    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    const remoteLead = await remoteClient.createObject('lead', remoteCreateParams);
    const leadModel = await this.prisma.crmLead.create({
      data: fromRemoteLeadToModel(connectionId, customerId, remoteLead),
    });
    return fromLeadModel(leadModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: LeadUpdateParams): Promise<Lead> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundLeadModel = await this.prisma.crmLead.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundLeadModel.customerId !== customerId) {
      throw new Error('Lead customerId does not match');
    }

    const remoteUpdateParams = { ...updateParams };
    if (updateParams.ownerId) {
      remoteUpdateParams.ownerId = await getRemoteId(this.prisma, updateParams.ownerId, 'user');
    }

    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    const remoteLead = await remoteClient.updateObject('lead', {
      ...remoteUpdateParams,
      id: foundLeadModel.remoteId,
    });

    // This can happen for hubspot if 2 records got merged. In this case, we should update both.
    if (foundLeadModel.remoteId !== remoteLead.id) {
      await this.prisma.crmLead.updateMany({
        where: {
          remoteId: {
            in: [foundLeadModel.remoteId, remoteLead.id],
          },
          connectionId: foundLeadModel.connectionId,
        },
        data: {
          ...fromRemoteLeadToModel(connectionId, customerId, remoteLead),
          remoteId: undefined,
          ownerId: updateParams.ownerId,
        },
      });
      return await this.getById(updateParams.id, connectionId, {});
    }

    const leadModel = await this.prisma.crmLead.update({
      data: {
        ...fromRemoteLeadToModel(connectionId, customerId, remoteLead),
        ownerId: updateParams.ownerId,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromLeadModel(leadModel);
  }

  public async upsertRemoteRecords(
    connectionId: string,
    customerId: string,
    remoteRecordsReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = COMMON_MODEL_DB_TABLES.crm.leads;
    const tempTable = 'crm_leads_temp';
    const columnsWithoutId = [
      'remote_id',
      'customer_id',
      'connection_id',
      'lead_source',
      'title',
      'company',
      'first_name',
      'last_name',
      'addresses',
      'phone_numbers',
      'email_addresses',
      'remote_created_at',
      'remote_updated_at',
      'remote_was_deleted',
      'remote_deleted_at',
      'detected_or_remote_deleted_at',
      'last_modified_at',
      'converted_date',
      '_converted_remote_account_id',
      'converted_account_id',
      '_converted_remote_contact_id',
      'converted_contact_id',
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
      fromRemoteLeadToDbLeadParams,
      onUpsertBatchCompletion
    );
  }
}
