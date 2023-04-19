import type { Opportunity, OpportunityCreateParams, OpportunityUpdateParams } from '@supaglue/types';
import { CommonModelBaseService } from './base_service';

export class OpportunityService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async create(
    customerId: string,
    connectionId: string,
    createParams: OpportunityCreateParams
  ): Promise<Opportunity> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.createOpportunity(createParams);
  }

  public async update(
    customerId: string,
    connectionId: string,
    updateParams: OpportunityUpdateParams
  ): Promise<Opportunity> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.updateOpportunity(updateParams);
  }
}
