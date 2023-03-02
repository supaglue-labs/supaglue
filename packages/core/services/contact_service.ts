import type { PrismaClient } from '@supaglue/db';
import { NotFoundError, UnauthorizedError } from '../errors';
import { getExpandedAssociations } from '../lib/expand';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { refreshAccessTokenIfNecessary } from '../lib/refresh_token';
import { fromContactModel } from '../mappers';
import type {
  Contact,
  ContactCreateParams,
  ContactSyncUpsertParams,
  ContactUpdateParams,
  GetParams,
  ListParams,
  PaginatedResult,
} from '../types';
import type { ConnectionService } from './connection_service';
import type { RemoteService } from './remote_service';

export class ContactService {
  #prisma: PrismaClient;
  #remoteService: RemoteService;
  #connectionService: ConnectionService;

  constructor(prisma: PrismaClient, remoteService: RemoteService, connectionService: ConnectionService) {
    this.#prisma = prisma;
    this.#remoteService = remoteService;
    this.#connectionService = connectionService;
  }

  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Contact> {
    const { expand } = getParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const model = await this.#prisma.crmContact.findUnique({
      where: { id },
      include: {
        account: expandedAssociations.includes('account'),
      },
    });
    if (!model) {
      throw new NotFoundError(`Can't find contact with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromContactModel(model);
  }

  public async list(connectionId: string, listParams: ListParams): Promise<PaginatedResult<Contact>> {
    const { page_size, cursor, created_after, created_before, updated_after, updated_before, expand } = listParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.#prisma.crmContact.findMany({
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
    const results = models.map((model) => fromContactModel(model, expandedAssociations));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async create(customerId: string, connectionId: string, createParams: ContactCreateParams): Promise<Contact> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    await refreshAccessTokenIfNecessary(connectionId, remoteClient, this.#connectionService);
    const remoteContact = await remoteClient.createContact(createParams);
    const contactModel = await this.#prisma.crmContact.create({
      data: {
        customerId,
        connectionId,
        ...remoteContact,
      },
    });
    return fromContactModel(contactModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: ContactUpdateParams): Promise<Contact> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundContactModel = await this.#prisma.crmContact.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundContactModel.customerId !== customerId) {
      throw new Error('Contact customerId does not match');
    }

    const remoteClient = await this.#remoteService.getCrmRemoteClient(connectionId);
    await refreshAccessTokenIfNecessary(connectionId, remoteClient, this.#connectionService);
    const remoteContact = await remoteClient.updateContact({
      ...updateParams,
      remoteId: foundContactModel.remoteId,
    });

    const contactModel = await this.#prisma.crmContact.update({
      data: remoteContact,
      where: {
        id: updateParams.id,
      },
    });
    return fromContactModel(contactModel);
  }

  // TODO: We should do this performantly, which may involve COPY to temp table
  // and bulk upsert from there.
  public async upsertRemoteContacts(connectionId: string, upsertParamsList: ContactSyncUpsertParams[]): Promise<void> {
    for (const upsertParams of upsertParamsList) {
      await this.#prisma.crmContact.upsert({
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
    const contactsWithDanglingAccounts = await this.#prisma.crmContact.findMany({
      where: {
        connectionId,
        accountId: null,
        NOT: {
          remoteAccountId: null,
        },
      },
    });

    const danglingRemoteAccountIds = contactsWithDanglingAccounts.map(
      ({ remoteAccountId }) => remoteAccountId
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
        return this.#prisma.crmContact.updateMany({
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
  }
}
