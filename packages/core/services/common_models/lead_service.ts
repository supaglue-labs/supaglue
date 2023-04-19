import type { Lead, LeadCreateParams, LeadUpdateParams } from '@supaglue/types';
import { getRemoteId } from '../../lib/remote_id';
import { fromLeadModel } from '../../mappers';
import { CommonModelBaseService, getLastModifiedAt } from './base_service';

export class LeadService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async create(customerId: string, connectionId: string, createParams: LeadCreateParams): Promise<Lead> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await getRemoteId(this.prisma, createParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.createLead(remoteCreateParams);
    const leadModel = await this.prisma.crmLead.create({
      data: {
        customerId,
        connectionId,
        lastModifiedAt: getLastModifiedAt(remoteLead),
        ...remoteLead,
        ownerId: createParams.ownerId,
      },
    });
    return fromLeadModel(leadModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: LeadUpdateParams): Promise<Lead> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundLeadModel = await this.prisma.crmLead.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundLeadModel.customerId !== customerId) {
      throw new Error('Lead customerId does not match');
    }

    const remoteUpdateParams = { ...updateParams };
    if (updateParams.ownerId) {
      remoteUpdateParams.ownerId = await await getRemoteId(this.prisma, updateParams.ownerId, 'user');
    }

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteLead = await remoteClient.updateLead({
      ...remoteUpdateParams,
      remoteId: foundLeadModel.remoteId,
    });

    const leadModel = await this.prisma.crmLead.update({
      data: {
        ...remoteLead,
        lastModifiedAt: getLastModifiedAt(remoteLead),
        ownerId: updateParams.ownerId,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromLeadModel(leadModel);
  }
}
