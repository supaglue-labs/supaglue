import type { PrismaClient } from '@supaglue/db';
import { NotFoundError, UnauthorizedError } from '../errors';
import { getExpandedAssociations } from '../lib/expand';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromLeadModel } from '../mappers';
import type {
  GetParams,
  Lead,
  LeadCreateParams,
  LeadSyncUpsertParams,
  LeadUpdateParams,
  ListParams,
  PaginatedResult,
} from '../types';
import type { ConnectionService } from './connection_service';
import type { RemoteService } from './remote_service';

export class LeadService {
  #prisma: PrismaClient;
  #remoteService: RemoteService;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, remoteService: RemoteService, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#remoteService = remoteService;
    this.#connectionService = connectionService;
  }

  // TODO: implement getParams
  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Lead> {
    const { expand } = getParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const model = await this.#prisma.crmLead.findUnique({
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
    const models = await this.#prisma.crmLead.findMany({
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
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.createLead(createParams);
    const leadModel = await this.#prisma.crmLead.create({
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
    const foundLeadModel = await this.#prisma.crmLead.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundLeadModel.customerId !== customerId) {
      throw new Error('Lead customerId does not match');
    }

    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.updateLead({
      ...updateParams,
      remoteId: foundLeadModel.remoteId,
    });

    const leadModel = await this.#prisma.crmLead.update({
      data: remoteLead,
      where: {
        id: updateParams.id,
      },
    });
    return fromLeadModel(leadModel);
  }

  // TODO: We should do this performantly, which may involve COPY to temp table
  // and bulk upsert from there.
  public async upsertRemoteLeads(connectionId: string, upsertParamsList: LeadSyncUpsertParams[]): Promise<void> {
    for (const upsertParams of upsertParamsList) {
      await this.#prisma.crmLead.upsert({
        where: {
          connectionId_remoteId: {
            connectionId,
            remoteId: upsertParams.remoteId,
          },
        },
        update: upsertParams,
        create: upsertParams,
      });
    }
  }

  public async updateDanglingAccounts(connectionId: string) {
    const leadsWithDanglingAccounts = await this.#prisma.crmLead.findMany({
      where: {
        connectionId,
        convertedAccountId: null,
        NOT: {
          convertedRemoteAccountId: null,
        },
      },
    });

    const danglingRemoteAccountIds = leadsWithDanglingAccounts.map(
      ({ convertedRemoteAccountId }) => convertedRemoteAccountId
    ) as string[];
    const crmAccounts = await this.#prisma.crmAccount.findMany({
      where: {
        connectionId,
        remoteId: {
          in: danglingRemoteAccountIds,
        },
      },
    });
    await Promise.all(
      crmAccounts.map(({ remoteId, id }) => {
        return this.#prisma.crmLead.updateMany({
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
  }

  public async updateDanglingContacts(connectionId: string) {
    const leadsWithDanglingContacts = await this.#prisma.crmLead.findMany({
      where: {
        connectionId,
        convertedContactId: null,
        NOT: {
          convertedRemoteContactId: null,
        },
      },
    });

    const danglingRemoteContactIds = leadsWithDanglingContacts.map(
      ({ convertedRemoteContactId }) => convertedRemoteContactId
    ) as string[];
    const crmContacts = await this.#prisma.crmContact.findMany({
      where: {
        connectionId,
        remoteId: {
          in: danglingRemoteContactIds,
        },
      },
    });
    await Promise.all(
      crmContacts.map(({ remoteId, id }) => {
        return this.#prisma.crmLead.updateMany({
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
  }
}
