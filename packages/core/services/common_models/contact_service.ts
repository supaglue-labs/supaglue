import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import type {
  Contact,
  ContactCreateParams,
  ContactFilters,
  ContactUpdateParams,
  GetInternalParams,
  ListInternalParams,
  PaginatedResult,
  SearchInternalParams,
} from '@supaglue/types';
import { Readable } from 'stream';
import { v5 as uuidv5 } from 'uuid';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { getRemoteId } from '../../lib/remote_id';
import { fromContactModel, fromRemoteContactToDbContactParams } from '../../mappers';
import { CommonModelBaseService, getLastModifiedAt, UpsertRemoteCommonModelsResult } from './base_service';

export class ContactService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetInternalParams): Promise<Contact> {
    const model = await this.prisma.crmContact.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find contact with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromContactModel(model, getParams);
  }

  public async search(
    connectionId: string,
    searchParams: SearchInternalParams,
    filters: ContactFilters
  ): Promise<PaginatedResult<Contact>> {
    const { page_size, cursor } = searchParams;
    const models = await this.prisma.crmContact.findMany({
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
    const results = models.map((model) => fromContactModel(model, searchParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
      results,
    };
  }

  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Contact>> {
    const { page_size, cursor, include_deleted_data, created_after, created_before, modified_after, modified_before } =
      listParams;

    const models = await this.prisma.crmContact.findMany({
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
    const results = models.map((model) => fromContactModel(model, listParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
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
        id: uuidv5(remoteContact.remoteId, connectionId),
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
      'account_id',
      '_remote_owner_id',
      'owner_id',
      'updated_at', // TODO: We should have default for this column in Postgres
      'raw_data',
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
}
