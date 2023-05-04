import { schemaPrefix } from '@supaglue/db';
import { GetInternalParams, ListInternalParams, PaginatedResult, User } from '@supaglue/types';
import { Readable } from 'stream';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from '..';
import { NotFoundError, UnauthorizedError } from '../../../errors';
import { getPaginationParams, getPaginationResult } from '../../../lib';
import { fromRemoteUserToDbUserParams, fromUserModel } from '../../../mappers';

export class UserService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetInternalParams): Promise<User> {
    const model = await this.prisma.crmUser.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find user with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromUserModel(model, getParams);
  }

  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<User>> {
    const { page_size, cursor, include_deleted_data, created_after, created_before, modified_after, modified_before } =
      listParams;
    const models = await this.prisma.crmUser.findMany({
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
    const results = models.map((model) => fromUserModel(model, listParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
      results,
    };
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
      'raw_data',
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
