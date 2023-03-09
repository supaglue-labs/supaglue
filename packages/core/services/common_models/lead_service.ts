import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { POSTGRES_UPDATE_BATCH_SIZE } from '../../lib/constants';
import { getExpandedAssociations } from '../../lib/expand';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { fromLeadModel, fromRemoteLeadToDbLeadParams } from '../../mappers';
import type { GetParams, Lead, LeadCreateParams, LeadUpdateParams, ListParams, PaginatedResult } from '../../types';
import { CommonModelBaseService } from './base_service';

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
    const { page_size, cursor, created_after, created_before, updated_after, updated_before, expand } = listParams;
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
        remoteUpdatedAt: {
          gt: updated_after,
          lt: updated_before,
        },
      },
      include: {
        convertedAccount: expandedAssociations.includes('converted_account'),
        convertedContact: expandedAssociations.includes('converted_contact'),
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

  public async create(customerId: string, connectionId: string, createParams: LeadCreateParams): Promise<Lead> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.createLead(createParams);
    const leadModel = await this.prisma.crmLead.create({
      data: {
        customerId,
        connectionId,
        ...remoteLead,
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

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.updateLead({
      ...updateParams,
      remoteId: foundLeadModel.remoteId,
    });

    const leadModel = await this.prisma.crmLead.update({
      data: remoteLead,
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
  ): Promise<void> {
    // TODO: Shouldn't be hard-coding the DB schema here.
    const table = 'api.crm_leads';
    const tempTable = 'crm_leads_temp';
    const columnsWithoutId = [
      'remote_id',
      'customer_id',
      'connection_id',
      'remote_was_deleted',
      'owner',
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
      'converted_date',
      '_converted_remote_account_id',
      '_converted_remote_contact_id',
      'updated_at', // TODO: We should have default for this column in Postgres
    ];

    await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteLeadsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteLeadToDbLeadParams
    );
  }

  private async updateDanglingAccountsImpl(
    connectionId: string,
    limit: number,
    cursor?: string
  ): Promise<string | undefined> {
    const leadsWithDanglingAccounts = await this.prisma.crmLead.findMany({
      where: {
        connectionId,
        convertedAccountId: null,
        NOT: {
          convertedRemoteAccountId: null,
        },
      },
      skip: cursor ? 1 : undefined,
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: 'asc',
      },
    });
    if (!leadsWithDanglingAccounts.length) {
      return;
    }

    const danglingRemoteAccountIds = leadsWithDanglingAccounts.map(
      ({ convertedRemoteAccountId }) => convertedRemoteAccountId
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
        return this.prisma.crmLead.updateMany({
          where: {
            connectionId,
            convertedRemoteAccountId: remoteId,
          },
          data: {
            convertedAccountId: id,
          },
        });
      })
    );
    return leadsWithDanglingAccounts[leadsWithDanglingAccounts.length - 1].id;
  }

  public async updateDanglingAccounts(connectionId: string) {
    let cursor = undefined;
    do {
      cursor = await this.updateDanglingAccountsImpl(connectionId, POSTGRES_UPDATE_BATCH_SIZE, cursor);
    } while (cursor);
  }

  private async updateDanglingContactsImpl(
    connectionId: string,
    limit: number,
    cursor?: string
  ): Promise<string | undefined> {
    const leadsWithDanglingContacts = await this.prisma.crmLead.findMany({
      where: {
        connectionId,
        convertedContactId: null,
        NOT: {
          convertedRemoteContactId: null,
        },
      },
      skip: cursor ? 1 : undefined,
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: 'asc',
      },
    });
    if (!leadsWithDanglingContacts.length) {
      return;
    }

    const danglingRemoteContactIds = leadsWithDanglingContacts.map(
      ({ convertedRemoteContactId }) => convertedRemoteContactId
    ) as string[];
    const crmContacts = await this.prisma.crmContact.findMany({
      where: {
        connectionId,
        remoteId: {
          in: danglingRemoteContactIds,
        },
      },
    });
    await Promise.all(
      crmContacts.map(({ remoteId, id }) => {
        return this.prisma.crmLead.updateMany({
          where: {
            connectionId,
            convertedRemoteContactId: remoteId,
          },
          data: {
            convertedContactId: id,
          },
        });
      })
    );
    return leadsWithDanglingContacts[leadsWithDanglingContacts.length - 1].id;
  }

  public async updateDanglingContacts(connectionId: string) {
    let cursor = undefined;
    do {
      cursor = await this.updateDanglingContactsImpl(connectionId, POSTGRES_UPDATE_BATCH_SIZE, cursor);
    } while (cursor);
  }
}
