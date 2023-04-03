import { COMMON_MODEL_DB_TABLES, schemaPrefix } from '@supaglue/db';
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

  public async updateDanglingOwners(connectionId: string): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const usersTable = COMMON_MODEL_DB_TABLES['users'];

    await this.prisma.crmEvent.updateMany({
      where: {
        remoteOwnerId: null,
        ownerId: {
          not: null,
        },
      },
      data: {
        ownerId: null,
      },
    });

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET owner_id = u.id
      FROM ${usersTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.connection_id = u.connection_id
        AND c.owner_id IS NULL
        AND c._remote_owner_id IS NOT NULL
        AND c._remote_owner_id = u.remote_id
      `);
  }

  public async updateDanglingAccounts(connectionId: string): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const accountsTable = COMMON_MODEL_DB_TABLES['accounts'];

    await this.prisma.crmEvent.updateMany({
      where: {
        remoteAccountId: null,
        accountId: {
          not: null,
        },
      },
      data: {
        accountId: null,
      },
    });

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET account_id = u.id
      FROM ${accountsTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.connection_id = u.connection_id
        AND c.account_id IS NULL
        AND c._remote_account_id IS NOT NULL
        AND c._remote_account_id = u.remote_id
      `);
  }

  public async updateDanglingContacts(connectionId: string): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const contactsTable = COMMON_MODEL_DB_TABLES['contacts'];

    await this.prisma.crmEvent.updateMany({
      where: {
        remoteContactId: null,
        contactId: {
          not: null,
        },
      },
      data: {
        contactId: null,
      },
    });

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET contact_id = u.id
      FROM ${contactsTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.connection_id = u.connection_id
        AND c.contact_id IS NULL
        AND c._remote_contact_id IS NOT NULL
        AND c._remote_contact_id = u.remote_id
      `);
  }

  public async updateDanglingLeads(connectionId: string): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const leadsTable = COMMON_MODEL_DB_TABLES['leads'];

    await this.prisma.crmEvent.updateMany({
      where: {
        remoteLeadId: null,
        leadId: {
          not: null,
        },
      },
      data: {
        leadId: null,
      },
    });

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET lead_id = u.id
      FROM ${leadsTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.connection_id = u.connection_id
        AND c.lead_id IS NULL
        AND c._remote_lead_id IS NOT NULL
        AND c._remote_lead_id = u.remote_id
      `);
  }

  public async updateDanglingOpportunities(connectionId: string): Promise<void> {
    const eventsTable = COMMON_MODEL_DB_TABLES['events'];
    const opportunitiesTable = COMMON_MODEL_DB_TABLES['opportunities'];

    await this.prisma.crmEvent.updateMany({
      where: {
        remoteOpportunityId: null,
        opportunityId: {
          not: null,
        },
      },
      data: {
        opportunityId: null,
      },
    });

    await this.prisma.$executeRawUnsafe(`
      UPDATE ${eventsTable} c
      SET opportunity_id = u.id
      FROM ${opportunitiesTable} u
      WHERE
        c.connection_id = '${connectionId}'
        AND c.connection_id = u.connection_id
        AND c.opportunity_id IS NULL
        AND c._remote_opportunity_id IS NOT NULL
        AND c._remote_opportunity_id = u.remote_id
      `);
  }
}
