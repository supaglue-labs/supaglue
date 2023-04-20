import type { Account, AccountCreateParams, AccountUpdateParams } from '@supaglue/types';
import { Readable } from 'stream';
import { CommonModelBaseService } from './base_service';

export class AccountService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async create(customerId: string, connectionId: string, createParams: AccountCreateParams): Promise<Account> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.createAccount(createParams);
  }

  public async update(customerId: string, connectionId: string, updateParams: AccountUpdateParams): Promise<Account> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.updateAccount(updateParams);
  }

  public async exportAccounts(connectionId: string, customerId: string, accountsStream: Readable): Promise<void> {
    const schema = 'api'; // TODO: replace with setting from PostgresDestination
    const table = 'asdf';
  }
}
