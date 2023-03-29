import { COMMON_MODEL_DB_TABLES, schemaPrefix } from '@supaglue/db';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getExpandedAssociations } from '../../lib/expand';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { fromLeadModel, fromRemoteLeadToDbLeadParams } from '../../mappers';
import type { GetParams, Lead, LeadCreateParams, LeadUpdateParams, ListParams, PaginatedResult } from '../../types';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from './base_service';

export class LeadService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  // TODO: implement getParams
  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Lead> {
    const { expand } = getParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const model = await this.prisma.crmLead.findUnique({
      where: { id },
      include: {
        convertedAccount: expandedAssociations.includes('converted_account'),
        convertedContact: expandedAssociations.includes('converted_contact'),
        owner: expandedAssociations.includes('owner'),
      },
    });
    if (!model) {
      throw new NotFoundError(`Can't find Lead with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromLeadModel(model, expandedAssociations);
  }

  // TODO: implement rest of list params
  public async list(connectionId: string, listParams: ListParams): Promise<PaginatedResult<Lead>> {
    const { page_size, cursor, created_after, created_before, modified_after, modified_before, expand } = listParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.prisma.crmLead.findMany({
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
        remoteWasDeleted: false,
      },
      include: {
        convertedAccount: expandedAssociations.includes('converted_account'),
        convertedContact: expandedAssociations.includes('converted_contact'),
        owner: expandedAssociations.includes('owner'),
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromLeadModel(model, expandedAssociations));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  private async getAssociatedOwnerRemoteId(ownerId: string): Promise<string> {
    const crmUser = await this.prisma.crmUser.findUnique({
      where: {
        id: ownerId,
      },
    });
    if (!crmUser) {
      throw new NotFoundError(`User ${ownerId} not found`);
    }
    return crmUser.remoteId;
  }

  public async create(customerId: string, connectionId: string, createParams: LeadCreateParams): Promise<Lead> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await this.getAssociatedOwnerRemoteId(createParams.ownerId);
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.createLead(remoteCreateParams);
    const leadModel = await this.prisma.crmLead.create({
      data: {
        customerId,
        connectionId,
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
      remoteUpdateParams.ownerId = await this.getAssociatedOwnerRemoteId(updateParams.ownerId);
    }

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.updateLead({
      ...remoteUpdateParams,
      remoteId: foundLeadModel.remoteId,
    });

    const leadModel = await this.prisma.crmLead.update({
      data: { ...remoteLead, ownerId: updateParams.ownerId },
      where: {
        id: updateParams.id,
      },
    });
    return fromLeadModel(leadModel);
  }

  public async upsertRemoteLeads(
    connectionId: string,
    customerId: string,
    remoteLeadsReadable: Readable
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
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteLeadsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteLeadToDbLeadParams,
      (remoteLead) => remoteLead.remoteUpdatedAt
    );
  }

  public async updateDanglingAccounts(connectionId: string): Promise<void> {
    const leadsTable = COMMON_MODEL_DB_TABLES['leads'];
    const accountsTable = COMMON_MODEL_DB_TABLES['accounts'];

    await this.prisma.crmLead.updateMany({
      where: {
        convertedRemoteAccountId: null,
        convertedAccountId: {
          not: null,
        },
      },
      data: {
        convertedAccountId: null,
      },
    });

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${leadsTable} l
      SET converted_account_id = a.id
      FROM ${accountsTable} a
      WHERE
        l.connection_id = '${connectionId}'
        AND l.connection_id = a.connection_id
        AND l.converted_account_id IS NULL
        AND l._converted_remote_account_id IS NOT NULL
        AND l._converted_remote_account_id = a.remote_id
      `);
  }

  public async updateDanglingContacts(connectionId: string): Promise<void> {
    const leadsTable = COMMON_MODEL_DB_TABLES['leads'];
    const contactsTable = COMMON_MODEL_DB_TABLES['contacts'];

    await this.prisma.crmLead.updateMany({
      where: {
        convertedRemoteContactId: null,
        convertedContactId: {
          not: null,
        },
      },
      data: {
        convertedContactId: null,
      },
    });

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${leadsTable} l
      SET converted_contact_id = c.id
      FROM ${contactsTable} c
      WHERE
        l.connection_id = '${connectionId}'
        AND l.connection_id = c.connection_id
        AND l.converted_contact_id IS NULL
        AND l._converted_remote_contact_id IS NOT NULL
        AND l._converted_remote_contact_id = c.remote_id
      `);
  }

  public async updateDanglingOwners(connectionId: string): Promise<void> {
    const leadsTable = COMMON_MODEL_DB_TABLES['leads'];
    const usersTable = COMMON_MODEL_DB_TABLES['users'];

    await this.prisma.crmLead.updateMany({
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
      UPDATE ${leadsTable} c
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
