import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import type {
  Contact,
  ContactCreateParams,
  ContactFilters,
  ContactUpdateParams,
  GetParams,
  ListInternalParams,
  PaginatedResult,
  PaginationParams,
} from '@supaglue/types';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { logger } from '../../lib';
import { getExpandedAssociations } from '../../lib/expand';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { getRemoteId } from '../../lib/remote_id';
import { fromContactModel, fromRemoteContactToDbContactParams } from '../../mappers';
import { CommonModelBaseService, getLastModifiedAt, UpsertRemoteCommonModelsResult } from './base_service';

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

  public async search(
    connectionId: string,
    paginationParams: PaginationParams,
    filters: ContactFilters
  ): Promise<PaginatedResult<Contact>> {
    const { page_size, cursor } = paginationParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.prisma.crmContact.findMany({
      ...getPaginationParams(pageSize, cursor),
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
    const results = models.map((model) => fromContactModel(model));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Contact>> {
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
    const models = await this.prisma.crmContact.findMany({
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
    const results = models.map((model) => fromContactModel(model, expandedAssociations));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async create(customerId: string, connectionId: string, createParams: ContactCreateParams): Promise<Contact> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.accountId) {
      remoteCreateParams.accountId = await getRemoteId(this.prisma, createParams.accountId, 'account');
    }
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await getRemoteId(this.prisma, createParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteContact = await remoteClient.createContact(remoteCreateParams);
    const contactModel = await this.prisma.crmContact.create({
      data: {
        customerId,
        connectionId,
        lastModifiedAt: getLastModifiedAt(remoteContact),
        ...remoteContact,
        accountId: createParams.accountId,
        ownerId: createParams.ownerId,
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
      remoteUpdateParams.accountId = await getRemoteId(this.prisma, updateParams.accountId, 'account');
    }
    if (updateParams.ownerId) {
      remoteUpdateParams.ownerId = await getRemoteId(this.prisma, updateParams.ownerId, 'user');
    }

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteContact = await remoteClient.updateContact({
      ...remoteUpdateParams,
      remoteId: foundContactModel.remoteId,
    });

    const contactModel = await this.prisma.crmContact.update({
      data: {
        ...remoteContact,
        lastModifiedAt: getLastModifiedAt(remoteContact),
        accountId: updateParams.accountId,
        ownerId: updateParams.ownerId,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromContactModel(contactModel);
  }

  public async upsertRemoteContacts(
    connectionId: string,
    customerId: string,
    remoteContactsReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = COMMON_MODEL_DB_TABLES['contacts'];
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
      'lifecycle_stage',
      'last_activity_at',
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
      remoteContactsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteContactToDbContactParams,
      onUpsertBatchCompletion
    );
  }

  public async updateDanglingAccounts(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const contactsTable = COMMON_MODEL_DB_TABLES['contacts'];
    const accountsTable = COMMON_MODEL_DB_TABLES['accounts'];

    await this.prisma.crmContact.updateMany({
      where: {
        // Only update contacts for the given connection and that have been updated since the last sync (to be more efficient).
        connectionId,
        lastModifiedAt: {
          gt: startingLastModifiedAt,
        },
        remoteAccountId: null,
        accountId: {
          not: null,
        },
      },
      data: {
        accountId: null,
      },
    });

    logger.info('ContactService.updateDanglingAccounts: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${contactsTable} c
      SET account_id = a.id
      FROM ${accountsTable} a
      WHERE
        c.connection_id = '${connectionId}'
        AND c.last_modified_at > '${startingLastModifiedAt.toISOString()}'
        AND c.connection_id = a.connection_id
        AND c.account_id IS NULL
        AND c._remote_account_id IS NOT NULL
        AND c._remote_account_id = a.remote_id
      `);
  }

  public async updateDanglingOwners(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const contactsTable = COMMON_MODEL_DB_TABLES['contacts'];
    const usersTable = COMMON_MODEL_DB_TABLES['users'];

    await this.prisma.crmContact.updateMany({
      where: {
        // Only update contacts for the given connection and that have been updated since the last sync (to be more efficient).
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

    logger.info('ContactService.updateDanglingOwners: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${contactsTable} c
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
