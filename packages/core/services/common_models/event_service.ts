import { Event, EventCreateParams, EventUpdateParams } from '@supaglue/types';
import { getRemoteId } from '../../lib';
import { fromEventModel } from '../../mappers/event';
import { CommonModelBaseService, getLastModifiedAt } from './base_service';

export class EventService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async create(customerId: string, connectionId: string, createParams: EventCreateParams): Promise<Event> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteCreateParams = { ...createParams };
    if (createParams.accountId) {
      remoteCreateParams.accountId = await getRemoteId(this.prisma, createParams.accountId, 'account');
    }
    if (createParams.contactId) {
      remoteCreateParams.contactId = await getRemoteId(this.prisma, createParams.contactId, 'contact');
    }
    if (createParams.leadId) {
      remoteCreateParams.leadId = await getRemoteId(this.prisma, createParams.leadId, 'lead');
    }
    if (createParams.opportunityId) {
      remoteCreateParams.opportunityId = await getRemoteId(this.prisma, createParams.opportunityId, 'opportunity');
    }
    if (createParams.ownerId) {
      remoteCreateParams.ownerId = await getRemoteId(this.prisma, createParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteEvent = await remoteClient.createEvent(remoteCreateParams);
    const contactModel = await this.prisma.crmEvent.create({
      data: {
        customerId,
        connectionId,
        lastModifiedAt: getLastModifiedAt(remoteEvent),
        ...remoteEvent,
        accountId: createParams.accountId,
        ownerId: createParams.ownerId,
      },
    });
    return fromEventModel(contactModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: EventUpdateParams): Promise<Event> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundEventModel = await this.prisma.crmEvent.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundEventModel.customerId !== customerId) {
      throw new Error('Event customerId does not match');
    }

    const remoteUpdateParams = { ...updateParams };
    if (updateParams.accountId) {
      remoteUpdateParams.accountId = await getRemoteId(this.prisma, updateParams.accountId, 'account');
    }
    if (updateParams.contactId) {
      remoteUpdateParams.contactId = await getRemoteId(this.prisma, updateParams.contactId, 'contact');
    }
    if (updateParams.leadId) {
      remoteUpdateParams.leadId = await getRemoteId(this.prisma, updateParams.leadId, 'lead');
    }
    if (updateParams.opportunityId) {
      remoteUpdateParams.opportunityId = await getRemoteId(this.prisma, updateParams.opportunityId, 'opportunity');
    }
    if (updateParams.ownerId) {
      remoteUpdateParams.ownerId = await getRemoteId(this.prisma, updateParams.ownerId, 'user');
    }
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteEvent = await remoteClient.updateEvent({
      ...remoteUpdateParams,
      remoteId: foundEventModel.remoteId,
    });

    const contactModel = await this.prisma.crmEvent.update({
      data: {
        ...remoteEvent,
        lastModifiedAt: getLastModifiedAt(remoteEvent),
        accountId: updateParams.accountId,
        ownerId: updateParams.ownerId,
      },
      where: {
        id: updateParams.id,
      },
    });
    return fromEventModel(contactModel);
  }
}
