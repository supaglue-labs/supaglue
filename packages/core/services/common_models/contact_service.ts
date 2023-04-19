import type { Contact, ContactCreateParams, ContactUpdateParams } from '@supaglue/types';
import { CommonModelBaseService } from './base_service';

export class ContactService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async create(customerId: string, connectionId: string, createParams: ContactCreateParams): Promise<Contact> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.createContact(createParams);
  }

  public async update(customerId: string, connectionId: string, updateParams: ContactUpdateParams): Promise<Contact> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.updateContact(updateParams);
  }
}
