import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { POSTGRES_UPDATE_BATCH_SIZE } from '../../lib/constants';
import { getExpandedAssociations } from '../../lib/expand';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { fromContactModel, fromRemoteContactToDbContactParams } from '../../mappers';
import type {
  Contact,
  ContactCreateParams,
  ContactUpdateParams,
  GetParams,
  ListParams,
  PaginatedResult,
} from '../../types';
import { CommonModelBaseService } from './base_service';

export class ContactService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Contact> {
    const { expand } = getParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const model = await this.prisma.crmContact.findUnique({
      where: { id },
      include: {
        account: expandedAssociations.includes('account'),
        owner: expandedAssociations.includes('owner'),
      },
    });
    if (!model) {
      throw new NotFoundError(`Can't find contact with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromContactModel(model, expandedAssociations);
  }

  public async list(connectionId: string, listParams: ListParams): Promise<PaginatedResult<Contact>> {
    const { page_size, cursor, created_after, created_before, updated_after, updated_before, expand } = listParams;
    const expandedAssociations = getExpandedAssociations(expand);
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.prisma.crmContact.findMany({
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

  public async create(customerId: string, connectionId: string, createParams: ContactCreateParams): Promise<Contact> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.accountId) {
      remoteCreateParams.accountId = await this.getAssociatedAccountRemoteId(createParams.accountId);
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteContact = await remoteClient.createContact(remoteCreateParams);
    const contactModel = await this.prisma.crmContact.create({
      data: {
        customerId,
        connectionId,
        ...remoteContact,
        accountId: createParams.accountId,
      },
    });
    return fromContactModel(contactModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: ContactUpdateParams): Promise<Contact> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundContactModel = await this.prisma.crmContact.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundContactModel.customerId !== customerId) {
      throw new Error('Contact customerId does not match');
    }

    const remoteUpdateParams = { ...updateParams };
    if (updateParams.accountId) {
      remoteUpdateParams.accountId = await this.getAssociatedAccountRemoteId(updateParams.accountId);
    }

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteContact = await remoteClient.updateContact({
      ...remoteUpdateParams,
      remoteId: foundContactModel.remoteId,
    });

    const contactModel = await this.prisma.crmContact.update({
      data: { ...remoteContact, accountId: updateParams.accountId },
      where: {
        id: updateParams.id,
      },
    });
    return fromContactModel(contactModel);
  }

  public async upsertRemoteContacts(
    connectionId: string,
    customerId: string,
    remoteContactsReadable: Readable
  ): Promise<number> {
    // TODO: Shouldn't be hard-coding the DB schema here.
    const table = 'api.crm_contacts';
    const tempTable = 'crm_contacts_temp';
    const columnsWithoutId = [
      'remote_id',
      'customer_id',
      'connection_id',
      'first_name',
      'last_name',
      'addresses',
      'email_addresses',
      'phone_numbers',
      'last_activity_at',
      'remote_created_at',
      'remote_updated_at',
      'remote_was_deleted',
      '_remote_account_id',
      'updated_at', // TODO: We should have default for this column in Postgres
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteContactsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteContactToDbContactParams
    );
  }

  private async updateDanglingAccountsImpl(
    connectionId: string,
    limit: number,
    cursor?: string
  ): Promise<string | undefined> {
    const contactsWithDanglingAccounts = await this.prisma.crmContact.findMany({
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
    if (!contactsWithDanglingAccounts.length) {
      return;
    }

    const danglingRemoteAccountIds = contactsWithDanglingAccounts.map(
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
        return this.prisma.crmContact.updateMany({
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
    return contactsWithDanglingAccounts[contactsWithDanglingAccounts.length - 1].id;
  }

  public async updateDanglingAccounts(connectionId: string) {
    let cursor = undefined;
    do {
      cursor = await this.updateDanglingAccountsImpl(connectionId, POSTGRES_UPDATE_BATCH_SIZE, cursor);
    } while (cursor);
  }
}
