import { COMMON_MODEL_DB_TABLES, Prisma } from '@supaglue/db';
import { v5 as uuidv5 } from 'uuid';
import { CommonModelBaseService, getLastModifiedAt, UpsertRemoteCommonModelsResult } from '..';

import { GetInternalParams, ListInternalParams, PaginatedResult } from '@supaglue/types';
import { Contact, ContactCreateParams, ContactUpdateParams } from '@supaglue/types/engagement';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../../errors';
import { getPaginationParams, getPaginationResult } from '../../../lib';
import { fromContactModel, fromRemoteContactToDbContactParams } from '../../../mappers/engagement';
import { EngagementRemoteClient } from '../../../remotes/engagement/base';

export class ContactService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetInternalParams): Promise<Contact> {
    const model = await this.prisma.engagementContact.findUnique({
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

  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Contact>> {
    const { page_size, cursor, include_deleted_data, created_after, created_before, modified_after, modified_before } =
      listParams;

    const models = await this.prisma.engagementContact.findMany({
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
    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as EngagementRemoteClient;
    const remoteContact = await remoteClient.createObject('contact', remoteCreateParams);
    const contactModel = await this.prisma.engagementContact.create({
      data: {
        id: uuidv5(remoteContact.remoteId, connectionId),
        customerId,
        connectionId,
        ...remoteContact,
        lastModifiedAt: getLastModifiedAt(remoteContact),
        address: remoteContact.address as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput,
      },
    });
    return fromContactModel(contactModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: ContactUpdateParams): Promise<Contact> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundContactModel = await this.prisma.engagementContact.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundContactModel.customerId !== customerId) {
      throw new Error('Contact customerId does not match');
    }

    const remoteUpdateParams = { ...updateParams };
    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as EngagementRemoteClient;
    const remoteContact = await remoteClient.updateObject('contact', {
      ...remoteUpdateParams,
      remoteId: foundContactModel.remoteId,
    });

    const contactModel = await this.prisma.engagementContact.update({
      data: {
        ...remoteContact,
        lastModifiedAt: getLastModifiedAt(remoteContact),
        address: remoteContact.address as Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromContactModel(contactModel);
  }

  public async upsertRemoteRecords(
    connectionId: string,
    customerId: string,
    remoteRecordsReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = COMMON_MODEL_DB_TABLES.engagement.contacts;
    const tempTable = 'engagement_contacts_temp';
    const columnsWithoutId = [
      'remote_id',
      'customer_id',
      'connection_id',
      'first_name',
      'last_name',
      'job_title',
      'address',
      'email_addresses',
      'phone_numbers',
      'open_count',
      'click_count',
      'reply_count',
      'bounced_count',
      'remote_created_at',
      'remote_updated_at',
      'remote_was_deleted',
      'remote_deleted_at',
      'detected_or_remote_deleted_at',
      'last_modified_at',
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
      fromRemoteContactToDbContactParams,
      onUpsertBatchCompletion
    );
  }
}
