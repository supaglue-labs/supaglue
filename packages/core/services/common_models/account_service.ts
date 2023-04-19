import type { Account, AccountCreateParams, AccountUpdateParams } from '@supaglue/types';
import { getRemoteId } from '../../lib/remote_id';
import { fromAccountModel } from '../../mappers/index';
import { CommonModelBaseService, getLastModifiedAt } from './base_service';

export class AccountService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async create(customerId: string, connectionId: string, createParams: AccountCreateParams): Promise<Account> {
    // TODO: We may want to have better guarantees that we create the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await getRemoteId(this.prisma, createParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.createAccount(remoteCreateParams);
    const accountModel = await this.prisma.crmAccount.create({
      data: {
        customerId,
        connectionId,
        lastModifiedAt: getLastModifiedAt(remoteAccount),
        ...remoteAccount,
        ownerId: createParams.ownerId,
      },
    });
    return fromAccountModel(accountModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: AccountUpdateParams): Promise<Account> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundAccountModel = await this.prisma.crmAccount.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundAccountModel.customerId !== customerId) {
      throw new Error('Account customerId does not match');
    }

    const remoteUpdateParams = { ...updateParams };
    if (updateParams.ownerId) {
      remoteUpdateParams.ownerId = await getRemoteId(this.prisma, updateParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.updateAccount({
      ...remoteUpdateParams,
      remoteId: foundAccountModel.remoteId,
    });

    const accountModel = await this.prisma.crmAccount.update({
      data: {
        ...remoteAccount,
        lastModifiedAt: getLastModifiedAt(remoteAccount),
        ownerId: updateParams.ownerId,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromAccountModel(accountModel);
  }
}
