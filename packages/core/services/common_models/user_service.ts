import { schemaPrefix } from '@supaglue/db';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { fromRemoteUserToDbUserParams, fromUserModel } from '../../mappers/user';
import { ListParams, PaginatedResult } from '../../types/common';
import { User } from '../../types/crm';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from './base_service';

export class UserService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string): Promise<User> {
    const model = await this.prisma.crmUser.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find user with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromUserModel(model);
  }

  public async list(connectionId: string, listParams: ListParams): Promise<PaginatedResult<User>> {
    const { page_size, cursor, include_deleted_data, created_after, created_before, modified_after, modified_before } =
      listParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.prisma.crmUser.findMany({
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
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map(fromUserModel);
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async upsertRemoteUsers(
    connectionId: string,
    customerId: string,
    remoteUsersReadable: Readable
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
      (remoteUser) =>
        new Date(
          Math.max(remoteUser.remoteUpdatedAt?.getTime() || 0, remoteUser.detectedOrRemoteDeletedAt?.getTime() || 0)
        )
    );
  }
}
