import { Event, EventCreateParams, EventUpdateParams } from '@supaglue/types';
import { CommonModelBaseService } from './base_service';

export class EventService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async create(customerId: string, connectionId: string, createParams: EventCreateParams): Promise<Event> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.createEvent(createParams);
  }

  public async update(customerId: string, connectionId: string, updateParams: EventUpdateParams): Promise<Event> {
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    return await remoteClient.updateEvent(updateParams);
  }
}
