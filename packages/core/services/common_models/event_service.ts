import { schemaPrefix } from '@supaglue/db';
import { Event, ListInternalParams, PaginatedResult } from '@supaglue/types';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getExpandedAssociations } from '../../lib/expand';
import { getPaginationParams, getPaginationResult } from '../../lib/pagination';
import { fromEventModel, fromRemoteEventToDbEventParams } from '../../mappers/event';
import { CommonModelBaseService, UpsertRemoteCommonModelsResult } from './base_service';

export class EventService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string): Promise<Event> {
    const model = await this.prisma.crmEvent.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find event with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromEventModel(model);
  }

  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<Event>> {
    const {
      page_size,
      cursor,
      include_deleted_data,
      created_after,
      created_before,
      modified_after,
      modified_before,
      expand,
    } = listParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const expandedAssociations = getExpandedAssociations(expand);
    const models = await this.prisma.crmEvent.findMany({
      ...getPaginationParams(pageSize, cursor),
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
      include: {
        account: expandedAssociations.includes('account'),
        owner: expandedAssociations.includes('owner'),
        lead: expandedAssociations.includes('lead'),
        opportunity: expandedAssociations.includes('opportunity'),
        contact: expandedAssociations.includes('contact'),
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map((model) => fromEventModel(model, expandedAssociations));
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async upsertRemoteEvents(
    connectionId: string,
    customerId: string,
    remoteEventsReadable: Readable
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
      '_remote_contact_id',
      '_remote_lead_id',
      '_remote_opportunity_id',
      '_remote_owner_id',
      'updated_at', // TODO: We should have default for this column in Postgres
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteEventsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteEventToDbEventParams,
      (remoteEvent) =>
        new Date(
          Math.max(remoteEvent.remoteUpdatedAt?.getTime() || 0, remoteEvent.detectedOrRemoteDeletedAt?.getTime() || 0)
        )
    );
  }
}
