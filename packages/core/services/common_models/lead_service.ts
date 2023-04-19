import type { Lead, LeadCreateParams, LeadUpdateParams } from '@supaglue/types';
import { CommonModelBaseService } from './base_service';

export class LeadService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async create(customerId: string, connectionId: string, createParams: LeadCreateParams): Promise<Lead> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.createLead(createParams);
  }

  public async update(customerId: string, connectionId: string, updateParams: LeadUpdateParams): Promise<Lead> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.updateLead(updateParams);
  }
}
