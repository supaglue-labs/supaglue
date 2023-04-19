import { schemaPrefix } from '@supaglue/db';
import { Readable } from 'stream';
import { fromRemoteUserToDbUserParams } from '../../mappers/user';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from './base_service';

export class UserService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async upsertRemoteUsers(
    connectionId: string,
    customerId: string,
    remoteUsersReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = `${schemaPrefix}crm_users`;
    const tempTable = 'crm_users_temp';
    const columnsWithoutId = [
      'remote_id',
      'customer_id',
      'connection_id',
      'name',
      'email',
      'is_active',
      'remote_created_at',
      'remote_updated_at',
      'remote_was_deleted',
      'remote_deleted_at',
      'detected_or_remote_deleted_at',
      'last_modified_at',
      'updated_at', // TODO: We should have default for this column in Postgres
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteUsersReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteUserToDbUserParams,
      onUpsertBatchCompletion
    );
  }
}
