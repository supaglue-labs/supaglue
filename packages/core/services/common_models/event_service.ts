import { schemaPrefix } from '@supaglue/db';
import {
  Event,
  EventCreateParams,
  EventUpdateParams,
  GetInternalParams,
  ListInternalParams,
  PaginatedResult,
} from '@supaglue/types';
import { Readable } from 'stream';
import { v5 as uuidv5 } from 'uuid';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getPaginationParams, getPaginationResult, getRemoteId } from '../../lib';
import { fromEventModel, fromRemoteEventToDbEventParams } from '../../mappers/crm';
import { CrmRemoteClient } from '../../remotes/crm/base';
import { CommonModelBaseService, getLastModifiedAt, UpsertRemoteCommonModelsResult } from './base_service';

export class EventService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetInternalParams): Promise<Event> {
    const model = await this.prisma.crmEvent.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find event with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromEventModel(model, getParams);
  }

  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Event>> {
    const { page_size, cursor, include_deleted_data, created_after, created_before, modified_after, modified_before } =
      listParams;
    const models = await this.prisma.crmEvent.findMany({
      ...getPaginationParams(page_size, cursor),
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
    const results = models.map((model) => fromEventModel(model, listParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
      results,
    };
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
    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    const remoteEvent = await remoteClient.createObject('event', remoteCreateParams);
    const contactModel = await this.prisma.crmEvent.create({
      data: {
        id: uuidv5(remoteEvent.remoteId, connectionId),
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
    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as CrmRemoteClient;
    const remoteEvent = await remoteClient.updateObject('event', {
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

  public async upsertRemoteEvents(
    connectionId: string,
    customerId: string,
    remoteEventsReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = `${schemaPrefix}crm_events`;
    const tempTable = 'crm_events_temp';
    const columnsWithoutId = [
      'remote_id',
      'customer_id',
      'connection_id',
      'subject',
      'type',
      'content',
      'start_time',
      'end_time',
      'remote_created_at',
      'remote_updated_at',
      'remote_was_deleted',
      'remote_deleted_at',
      'detected_or_remote_deleted_at',
      'last_modified_at',
      '_remote_account_id',
      'account_id',
      '_remote_contact_id',
      'contact_id',
      '_remote_lead_id',
      'lead_id',
      '_remote_opportunity_id',
      'opportunity_id',
      '_remote_owner_id',
      'owner_id',
      'updated_at', // TODO: We should have default for this column in Postgres
      'raw_data',
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteEventsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteEventToDbEventParams,
      onUpsertBatchCompletion
    );
  }
}
