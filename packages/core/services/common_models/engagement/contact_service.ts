import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from '..';

import { Readable } from 'stream';
import { fromRemoteContactToDbContactParams } from '../../../mappers';

export class ContactService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
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
