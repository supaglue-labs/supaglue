import { COMMON_MODEL_DB_TABLES, schemaPrefix } from '@supaglue/db';
import {
  Event,
  EventCreateParams,
  EventUpdateParams,
  GetParams,
  ListInternalParams,
  PaginatedResult,
} from '@supaglue/types';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../errors';
import { getExpandedAssociations, getPaginationParams, getPaginationResult, getRemoteId, logger } from '../../lib';
import { fromEventModel, fromRemoteEventToDbEventParams } from '../../mappers/event';
import { CommonModelBaseService, getLastModifiedAt, UpsertRemoteCommonModelsResult } from './base_service';

export class EventService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, { expand }: GetParams): Promise<Event> {
    const expandedAssociations = getExpandedAssociations(expand);
    const model = await this.prisma.crmEvent.findUnique({
      where: { id },
      include: {
        account: expandedAssociations.includes('account'),
        owner: expandedAssociations.includes('owner'),
        lead: expandedAssociations.includes('lead'),
        contact: expandedAssociations.includes('contact'),
        opportunity: expandedAssociations.includes('opportunity'),
      },
    });
    if (!model) {
      throw new NotFoundError(`Can't find event with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromEventModel(model, expandedAssociations);
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
    const expandedAssociations = getExpandedAssociations(expand);
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
      onUpsertBatchCompletion
    );
  }

  public async updateDanglingOwners(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const usersTable = COMMON_MODEL_DB_TABLES['users'];

    await this.prisma.crmEvent.updateMany({
      where: {
        // Only update events for the given connection and that have been updated since the last sync (to be more efficient).
        connectionId,
        lastModifiedAt: {
          gt: startingLastModifiedAt,
        },
        remoteOwnerId: null,
        ownerId: {
          not: null,
        },
      },
      data: {
        ownerId: null,
      },
    });

    logger.info('EventService.updateDanglingOwners: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET owner_id = u.id
      FROM ${usersTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.last_modified_at > '${startingLastModifiedAt.toISOString()}'
        AND c.connection_id = u.connection_id
        AND c.owner_id IS NULL
        AND c._remote_owner_id IS NOT NULL
        AND c._remote_owner_id = u.remote_id
      `);
  }

  public async updateDanglingAccounts(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const accountsTable = COMMON_MODEL_DB_TABLES['accounts'];

    await this.prisma.crmEvent.updateMany({
      where: {
        // Only update events for the given connection and that have been updated since the last sync (to be more efficient).
        connectionId,
        lastModifiedAt: {
          gt: startingLastModifiedAt,
        },
        remoteAccountId: null,
        accountId: {
          not: null,
        },
      },
      data: {
        accountId: null,
      },
    });

    logger.info('EventService.updateDanglingAccounts: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET account_id = u.id
      FROM ${accountsTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.last_modified_at > '${startingLastModifiedAt.toISOString()}'
        AND c.connection_id = u.connection_id
        AND c.account_id IS NULL
        AND c._remote_account_id IS NOT NULL
        AND c._remote_account_id = u.remote_id
      `);
  }

  public async updateDanglingContacts(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const contactsTable = COMMON_MODEL_DB_TABLES['contacts'];

    await this.prisma.crmEvent.updateMany({
      where: {
        // Only update events for the given connection and that have been updated since the last sync (to be more efficient).
        connectionId,
        lastModifiedAt: {
          gt: startingLastModifiedAt,
        },
        remoteContactId: null,
        contactId: {
          not: null,
        },
      },
      data: {
        contactId: null,
      },
    });

    logger.info('EventService.updateDanglingContacts: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET contact_id = u.id
      FROM ${contactsTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.last_modified_at > '${startingLastModifiedAt.toISOString()}'
        AND c.connection_id = u.connection_id
        AND c.contact_id IS NULL
        AND c._remote_contact_id IS NOT NULL
        AND c._remote_contact_id = u.remote_id
      `);
  }

  public async updateDanglingLeads(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const leadsTable = COMMON_MODEL_DB_TABLES['leads'];

    await this.prisma.crmEvent.updateMany({
      where: {
        // Only update events for the given connection and that have been updated since the last sync (to be more efficient).
        connectionId,
        lastModifiedAt: {
          gt: startingLastModifiedAt,
        },
        remoteLeadId: null,
        leadId: {
          not: null,
        },
      },
      data: {
        leadId: null,
      },
    });

    logger.info('EventService.updateDanglingLeads: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET lead_id = u.id
      FROM ${leadsTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.last_modified_at > '${startingLastModifiedAt.toISOString()}'
        AND c.connection_id = u.connection_id
        AND c.lead_id IS NULL
        AND c._remote_lead_id IS NOT NULL
        AND c._remote_lead_id = u.remote_id
      `);
  }

  public async updateDanglingOpportunities(connectionId: string, startingLastModifiedAt: Date): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const opportunitiesTable = COMMON_MODEL_DB_TABLES['opportunities'];

    await this.prisma.crmEvent.updateMany({
      where: {
        // Only update events for the given connection and that have been updated since the last sync (to be more efficient).
        connectionId,
        lastModifiedAt: {
          gt: startingLastModifiedAt,
        },
        remoteOpportunityId: null,
        opportunityId: {
          not: null,
        },
      },
      data: {
        opportunityId: null,
      },
    });

    logger.info('EventService.updateDanglingOpportunitiess: halfway');

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET opportunity_id = u.id
      FROM ${opportunitiesTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.last_modified_at > '${startingLastModifiedAt.toISOString()}'
        AND c.connection_id = u.connection_id
        AND c.opportunity_id IS NULL
        AND c._remote_opportunity_id IS NOT NULL
        AND c._remote_opportunity_id = u.remote_id
      `);
  }
}
