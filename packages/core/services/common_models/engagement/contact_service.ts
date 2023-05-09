import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from '..';

import { GetInternalParams, ListInternalParams, PaginatedResult } from '@supaglue/types';
import { Contact } from '@supaglue/types/engagement';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../../errors';
import { getPaginationParams, getPaginationResult } from '../../../lib';
import { fromContactModel, fromRemoteContactToDbContactParams } from '../../../mappers/engagement';

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
