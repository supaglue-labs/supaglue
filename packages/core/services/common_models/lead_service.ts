import { COMMON_MODEL_DB_TABLES, schemaPrefix } from '@supaglue/db';
import type {
  GetInternalParams,
  Lead,
  LeadCreateParams,
  LeadFilters,
  LeadUpdateParams,
  ListInternalParams,
  PaginatedResult,
  SearchInternalParams,
} from '@supaglue/types';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { logger } from '../../lib';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { getRemoteId } from '../../lib/remote_id';
import { fromLeadModel, fromRemoteLeadToDbLeadParams } from '../../mappers';
import { CommonModelBaseService, getLastModifiedAt, UpsertRemoteCommonModelsResult } from './base_service';

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
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.createLead(remoteCreateParams);
    const leadModel = await this.prisma.crmLead.create({
      data: {
        customerId,
        connectionId,
        lastModifiedAt: getLastModifiedAt(remoteLead),
        ...remoteLead,
        ownerId: createParams.ownerId,
      },
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
      remoteUpdateParams.ownerId = await await getRemoteId(this.prisma, updateParams.ownerId, 'user');
    }

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.updateLead({
      ...remoteUpdateParams,
      remoteId: foundLeadModel.remoteId,
    });

    const leadModel = await this.prisma.crmLead.update({
      data: {
        ...remoteLead,
        lastModifiedAt: getLastModifiedAt(remoteLead),
        ownerId: updateParams.ownerId,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromLeadModel(leadModel);
  }

  public async upsertRemoteLeads(
    connectionId: string,
    customerId: string,
    remoteLeadsReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = `${schemaPrefix}crm_leads`;
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
      '_converted_remote_contact_id',
      '_remote_owner_id',
      'updated_at', // TODO: We should have default for this column in Postgres
      'raw_data',
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteLeadsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteLeadToDbLeadParams,
      onUpsertBatchCompletion
    );
  }

  public async updateDanglingAccounts(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const leadsTable = COMMON_MODEL_DB_TABLES['leads'];
    const accountsTable = COMMON_MODEL_DB_TABLES['accounts'];

    await this.prisma.crmLead.updateMany({
      where: {
        // Only update accounts for the given connection and that have been updated since the last sync (to be more efficient).
        connectionId,
        lastModifiedAt: {
          gt: startingLastModifiedAt,
        },
        convertedRemoteAccountId: null,
        convertedAccountId: {
          not: null,
        },
      },
      data: {
        convertedAccountId: null,
      },
    });

    logger.info('LeadService.updateDanglingAccounts: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${leadsTable} l
      SET converted_account_id = a.id
      FROM ${accountsTable} a
      WHERE
        l.connection_id = '${connectionId}'
        AND l.last_modified_at > '${startingLastModifiedAt.toISOString()}'
        AND l.connection_id = a.connection_id
        AND l.converted_account_id IS NULL
        AND l._converted_remote_account_id IS NOT NULL
        AND l._converted_remote_account_id = a.remote_id
      `);
  }

  public async updateDanglingContacts(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const leadsTable = COMMON_MODEL_DB_TABLES['leads'];
    const contactsTable = COMMON_MODEL_DB_TABLES['contacts'];

    await this.prisma.crmLead.updateMany({
      where: {
        // Only update contacts for the given connection and that have been updated since the last sync (to be more efficient).
        connectionId,
        lastModifiedAt: {
          gt: startingLastModifiedAt,
        },
        convertedRemoteContactId: null,
        convertedContactId: {
          not: null,
        },
      },
      data: {
        convertedContactId: null,
      },
    });

    logger.info('LeadService.updateDanglingContact: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${leadsTable} l
      SET converted_contact_id = c.id
      FROM ${contactsTable} c
      WHERE
        l.connection_id = '${connectionId}'
        AND l.last_modified_at > '${startingLastModifiedAt.toISOString()}'
        AND l.connection_id = c.connection_id
        AND l.converted_contact_id IS NULL
        AND l._converted_remote_contact_id IS NOT NULL
        AND l._converted_remote_contact_id = c.remote_id
      `);
  }

  public async updateDanglingOwners(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const leadsTable = COMMON_MODEL_DB_TABLES['leads'];
    const usersTable = COMMON_MODEL_DB_TABLES['users'];

    await this.prisma.crmLead.updateMany({
      where: {
        // Only update leads for the given connection and that have been updated since the last sync (to be more efficient).
        connectionId,
        lastModifiedAt: {
          gt: startingLastModifiedAt,
        },
        remoteOwnerId: null,
        ownerId: {
          not: null,
        },
      },
      data: {
        ownerId: null,
      },
    });

    logger.info('LeadService.updateDanglingOwners: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${leadsTable} c
      SET owner_id = u.id
      FROM ${usersTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.last_modified_at > '${startingLastModifiedAt.toISOString()}'
        AND c.connection_id = u.connection_id
        AND c.owner_id IS NULL
        AND c._remote_owner_id IS NOT NULL
        AND c._remote_owner_id = u.remote_id
      `);
  }
}
