import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { fromRemoteUserToDbUserParams, fromUserModel } from '../../mappers/user';
import { ListParams, PaginatedResult } from '../../types/common';
import { User, UserCreateParams, UserUpdateParams } from '../../types/crm';
import { CommonModelBaseService } from './base_service';

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
    const { page_size, cursor, created_after, created_before, updated_after, updated_before } = listParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.prisma.crmUser.findMany({
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

  public async create(customerId: string, connectionId: string, createParams: UserCreateParams): Promise<User> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteUser = await remoteClient.createUser(remoteCreateParams);
    const userModel = await this.prisma.crmUser.create({
      data: {
        customerId,
        connectionId,
        ...remoteUser,
      },
    });
    return fromUserModel(userModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: UserUpdateParams): Promise<User> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundUserModel = await this.prisma.crmUser.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundUserModel.customerId !== customerId) {
      throw new Error('User customerId does not match');
    }

    const remoteUpdateParams = { ...updateParams };

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteUser = await remoteClient.updateUser({
      ...remoteUpdateParams,
      remoteId: foundUserModel.remoteId,
    });

    const userModel = await this.prisma.crmUser.update({
      data: remoteUser,
      where: {
        id: updateParams.id,
      },
    });
    return fromUserModel(userModel);
  }

  public async upsertRemoteUsers(
    connectionId: string,
    customerId: string,
    remoteUsersReadable: Readable
  ): Promise<number> {
    // TODO: Shouldn't be hard-coding the DB schema here.
    const table = 'api.crm_users';
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
      'updated_at', // TODO: We should have default for this column in Postgres
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteUsersReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteUserToDbUserParams
    );
  }
}
