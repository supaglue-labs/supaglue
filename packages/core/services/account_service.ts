import { stringify } from 'csv-stringify';
import { from as copyFrom } from 'pg-copy-streams';
import { v4 as uuidv4 } from 'uuid';
import { NotFoundError, UnauthorizedError } from '../errors';
import { getPaginationParams, getPaginationResult } from '../lib/pagination';
import { fromAccountModel } from '../mappers';
import type {
  Account,
  AccountCreateParams,
  AccountSyncUpsertParams,
  AccountUpdateParams,
  GetParams,
  ListParams,
  PaginatedResult,
} from '../types';
import { CommonModelBaseService } from './common_model_base_service';

export class AccountService extends CommonModelBaseService {
  public constructor(...args: ConstructorParameters<typeof CommonModelBaseService>) {
    super(...args);
  }

  // TODO: implement getParams
  public async getById(id: string, connectionId: string, getParams: GetParams): Promise<Account> {
    const model = await this.prisma.crmAccount.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundError(`Can't find account with id: ${id}`);
    }
    if (model.connectionId !== connectionId) {
      throw new UnauthorizedError('Unauthorized');
    }
    return fromAccountModel(model);
  }

  // TODO: implement rest of list params
  public async list(connectionId: string, listParams: ListParams): Promise<PaginatedResult<Account>> {
    const { page_size, cursor, created_after, created_before, updated_after, updated_before } = listParams;
    const pageSize = page_size ? parseInt(page_size) : undefined;
    const models = await this.prisma.crmAccount.findMany({
      ...getPaginationParams(pageSize, cursor),
      where: {
        connectionId,
        remoteCreatedAt: {
          gt: created_after,
          lt: created_before,
        },
        remoteUpdatedAt: {
          gt: updated_after,
          lt: updated_before,
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
    const results = models.map(fromAccountModel);
    return {
      ...getPaginationResult(pageSize, cursor, results),
      results,
    };
  }

  public async create(customerId: string, connectionId: string, createParams: AccountCreateParams): Promise<Account> {
    // TODO: We may want to have better guarantees that we create the record in both our DB
    // and the external integration.
    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.createAccount(createParams);
    const accountModel = await this.prisma.crmAccount.create({
      data: {
        customerId,
        connectionId,
        ...remoteAccount,
      },
    });
    return fromAccountModel(accountModel);
  }

  public async update(customerId: string, connectionId: string, updateParams: AccountUpdateParams): Promise<Account> {
    // TODO: We may want to have better guarantees that we update the record in both our DB
    // and the external integration.
    const foundAccountModel = await this.prisma.crmAccount.findUniqueOrThrow({
      where: {
        id: updateParams.id,
      },
    });

    if (foundAccountModel.customerId !== customerId) {
      throw new Error('Account customerId does not match');
    }

    const remoteClient = await this.remoteService.getCrmRemoteClient(connectionId);
    const remoteAccount = await remoteClient.updateAccount({
      ...updateParams,
      remoteId: foundAccountModel.remoteId,
    });

    const accountModel = await this.prisma.crmAccount.update({
      data: remoteAccount,
      where: {
        id: updateParams.id,
      },
    });
    return fromAccountModel(accountModel);
  }

  public async upsertRemoteAccounts(connectionId: string, upsertParamsList: AccountSyncUpsertParams[]): Promise<void> {
    const client = await this.pgPool.connect();

    // TODO: On the first run, we should be able to directly write into the table and skip the temp table

    try {
      // TODO: Get schema (api) from config
      const table = 'api.crm_accounts';
      const tempTable = 'crm_accounts_temp';

      // Create a temporary table
      // TODO: In the future, we may want to create a permanent table with background reaper
      // so that we can resume in the case of failure during the COPY stage.
      // TODO: Maybe we don't need to include all
      await client.query(`CREATE TEMP TABLE IF NOT EXISTS ${tempTable} (LIKE ${table} INCLUDING ALL)`);

      // TODO: Define columns and mappers elsewhere
      // Columns
      const columnsWithoutId = [
        'owner',
        'name',
        'description',
        'industry',
        'website',
        'number_of_employees',
        'addresses',
        'phone_numbers',
        'last_activity_at',
        'remote_id',
        'remote_created_at',
        'remote_updated_at',
        'remote_was_deleted',
        'customer_id',
        'connection_id',
        'updated_at', // TODO: We should have default for this column in Postgres
      ];
      const columns = ['id', ...columnsWithoutId];

      // Output
      const stream = client.query(
        copyFrom(`COPY ${tempTable} (${columns.join(',')}) FROM STDIN WITH (DELIMITER ',', FORMAT CSV)`)
      );

      // Input
      const convertedUpsertParamsList = upsertParamsList.map((upsertParams) => ({
        id: uuidv4(),
        owner: upsertParams.owner,
        name: upsertParams.name,
        description: upsertParams.description,
        industry: upsertParams.industry,
        website: upsertParams.website,
        number_of_employees: upsertParams.numberOfEmployees,
        addresses: upsertParams.addresses,
        phone_numbers: upsertParams.phoneNumbers,
        last_activity_at: upsertParams.lastActivityAt?.toISOString(),
        remote_id: upsertParams.remoteId,
        remote_created_at: upsertParams.remoteCreatedAt?.toISOString(),
        remote_updated_at: upsertParams.remoteUpdatedAt?.toISOString(),
        remote_was_deleted: upsertParams.remoteWasDeleted,
        customer_id: upsertParams.customerId,
        connection_id: upsertParams.connectionId,
        updated_at: new Date().toISOString(),
      }));

      await new Promise((resolve, reject) => {
        const csvInput = stringify(
          convertedUpsertParamsList.map((upsertParams) => ({ ...upsertParams, id: uuidv4() })),
          {
            columns,
            cast: {
              boolean: (value: boolean) => value.toString(),
            },
          }
        );
        csvInput.on('error', reject);
        stream.on('error', reject);
        stream.on('finish', resolve);
        csvInput.pipe(stream);
      });

      // Copy from temp table
      const columnsToUpdate = columnsWithoutId.join(',');
      const excludedDolumnsToUpdate = columnsWithoutId.map((column) => `EXCLUDED.${column}`).join(',');
      await client.query(`INSERT INTO ${table}
SELECT * FROM ${tempTable}
ON CONFLICT (connection_id, remote_id)
DO UPDATE SET (${columnsToUpdate}) = (${excludedDolumnsToUpdate})`);
    } finally {
      client.release();
    }
  }
}
