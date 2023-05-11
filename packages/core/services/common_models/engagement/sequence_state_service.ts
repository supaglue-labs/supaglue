import { COMMON_MODEL_DB_TABLES } from '@supaglue/db';
import { v5 as uuidv5 } from 'uuid';
import { CommonModelBaseService, getLastModifiedAt, UpsertRemoteCommonModelsResult } from '..';

import { GetInternalParams, ListInternalParams, PaginatedResult } from '@supaglue/types';
import { RemoteSequenceStateCreateParams, SequenceState, SequenceStateCreateParams } from '@supaglue/types/engagement';
import { Readable } from 'stream';
import { NotFoundError, UnauthorizedError } from '../../../errors';
import { getPaginationParams, getPaginationResult } from '../../../lib';
import { fromRemoteSequenceStateToDbSequenceStateParams, fromSequenceStateModel } from '../../../mappers/engagement';
import { EngagementRemoteClient } from '../../../remotes/engagement/base';

export class SequenceStateService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  public async getById(id: string, connectionId: string, getParams: GetInternalParams): Promise<SequenceState> {
    const model = await this.prisma.engagementSequenceState.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find contact with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromSequenceStateModel(model, getParams);
  }

  public async list(connectionId: string, listParams: ListInternalParams): Promise<PaginatedResult<SequenceState>> {
    const { page_size, cursor, include_deleted_data, created_after, created_before, modified_after, modified_before } =
      listParams;

    const models = await this.prisma.engagementSequenceState.findMany({
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
    const results = models.map((model) => fromSequenceStateModel(model, listParams));
    return {
      ...getPaginationResult(page_size, cursor, results),
      results,
    };
  }

  async getRemoteCreateParams(createParams: SequenceStateCreateParams): Promise<RemoteSequenceStateCreateParams> {
    const mailbox = await this.prisma.engagementMailbox.findUnique({
      where: { id: createParams.mailboxId },
    });
    if (!mailbox) {
      throw new NotFoundError(`Can't find mailbox with id: ${createParams.mailboxId}`);
    }
    const contact = await this.prisma.engagementContact.findUnique({
      where: { id: createParams.contactId },
    });
    if (!contact) {
      throw new NotFoundError(`Can't find contact with id: ${createParams.contactId}`);
    }
    const sequence = await this.prisma.engagementSequence.findUnique({
      where: { id: createParams.sequenceId },
    });
    if (!sequence) {
      throw new NotFoundError(`Can't find sequence with id: ${createParams.sequenceId}`);
    }
    return {
      remoteMailboxId: mailbox.remoteId,
      remoteContactId: contact.remoteId,
      remoteSequenceId: sequence.remoteId,
    };
  }

  public async create(
    customerId: string,
    connectionId: string,
    createParams: SequenceStateCreateParams
  ): Promise<SequenceState> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const remoteCreateParams = await this.getRemoteCreateParams(createParams);
    const remoteClient = (await this.remoteService.getRemoteClient(connectionId)) as EngagementRemoteClient;
    const remoteSequenceState = await remoteClient.createObject('sequence_state', remoteCreateParams);
    const contactModel = await this.prisma.engagementSequenceState.create({
      data: {
        id: uuidv5(remoteSequenceState.remoteId, connectionId),
        customerId,
        connectionId,
        ...remoteSequenceState,
        lastModifiedAt: getLastModifiedAt(remoteSequenceState),
      },
    });
    return fromSequenceStateModel(contactModel);
  }

  public async upsertRemoteRecords(
    connectionId: string,
    customerId: string,
    remoteRecordsReadable: Readable,
    onUpsertBatchCompletion: (offset: number, numRecords: number) => void
  ): Promise<UpsertRemoteCommonModelsResult> {
    const table = COMMON_MODEL_DB_TABLES.engagement.sequence_states;
    const tempTable = 'engagement_sequence_states_temp';
    const columnsWithoutId = [
      'remote_id',
      'customer_id',
      'connection_id',
      'state',
      'remote_created_at',
      'remote_updated_at',
      'remote_was_deleted',
      'remote_deleted_at',
      'detected_or_remote_deleted_at',
      'last_modified_at',
      '_remote_contact_id',
      'contact_id',
      '_remote_sequence_id',
      'sequence_id',
      '_remote_mailbox_id',
      'mailbox_id',
      'updated_at', // TODO: We should have default for this column in Postgres
      'raw_data',
    ];

    return await this.upsertRemoteCommonModels(
      connectionId,
      customerId,
      remoteRecordsReadable,
      table,
      tempTable,
      columnsWithoutId,
      fromRemoteSequenceStateToDbSequenceStateParams,
      onUpsertBatchCompletion
    );
  }
}
