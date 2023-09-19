import { BadRequestError } from '@supaglue/core/errors';
import type { Cursor, PaginatedSupaglueRecords, SupaglueStandardRecord } from '@supaglue/core/lib';
import {
  decodeCursor,
  DEFAULT_PAGE_SIZE,
  getCommonObjectTableName,
  getObjectTableName,
  getPaginatedSupaglueRecords,
  getPgPool,
  getSchemaName,
  isForward,
  MAX_PAGE_SIZE,
} from '@supaglue/core/lib';
import { getCategoryForProvider } from '@supaglue/core/remotes';
import type { DestinationService } from '@supaglue/core/services/destination_service';
import type { SyncService } from '@supaglue/core/services/sync_service';
import type { CommonObjectType, ProviderCategory, ProviderName } from '@supaglue/types';
import type { SnakecasedKeysCrmAccount, SnakecasedKeysCrmContact } from '@supaglue/types/crm';
import type { ObjectType } from '@supaglue/types/sync';
import type { Pool, PoolClient } from 'pg';

export class ManagedDataService {
  #pgPool: Pool;
  #syncService: SyncService;
  #destinationService: DestinationService;
  constructor(syncService: SyncService, destinationService: DestinationService) {
    this.#syncService = syncService;
    this.#destinationService = destinationService;
    this.#pgPool = getPgPool(process.env.SUPAGLUE_MANAGED_DATABASE_URL!);
  }

  async #getClient(): Promise<PoolClient> {
    return await this.#pgPool.connect();
  }

  async #getRecords<T extends Record<string, unknown>>(
    applicationId: string,
    category: ProviderCategory,
    providerName: ProviderName,
    customerId: string,
    objectName: string,
    objectType: ObjectType,
    cursorStr?: string,
    modifiedAfter?: string,
    pageSize = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedSupaglueRecords<T>> {
    if (pageSize < 1) {
      throw new BadRequestError('Page size must be greater than 0');
    }
    if (pageSize > MAX_PAGE_SIZE) {
      throw new BadRequestError(`Page size cannot exceed ${MAX_PAGE_SIZE}`);
    }
    const sync = await this.#syncService.findByAppCustomerProviderNameObjectTypeAndObject(
      applicationId,
      customerId,
      providerName,
      objectType,
      objectName
    );
    if (!sync) {
      throw new BadRequestError(`No sync found for ${objectName} for customer ${customerId}`);
    }
    const destination = await this.#destinationService.getDestinationSafeBySyncConfigId(sync.syncConfigId);
    if (destination?.type !== 'supaglue') {
      throw new BadRequestError(`You must set up a Supaglue Managed Destination before you can use this feature.`);
    }
    const cursor = cursorStr ? decodeCursor(cursorStr) : undefined;
    const schema = getSchemaName(applicationId);
    const table =
      objectType === 'common'
        ? getCommonObjectTableName(category, objectName as CommonObjectType)
        : getObjectTableName(providerName, objectName);
    const qualifiedTable = `${schema}.${table}`;
    const client = await this.#getClient();
    try {
      // Check if table even exists
      const { rows } = await client.query<{ total: string }>(
        getCountSql(qualifiedTable, customerId, objectType, modifiedAfter)
      );
      if (!rows.length) {
        throw new Error('No rows returned from count query');
      }
      const { total } = rows[0];
      // We fetch `pageSize + 1` records so we know if we need to return a `next` pagination.
      const result = await client.query<T>(
        getSql(qualifiedTable, customerId, objectType, pageSize + 1, cursor, modifiedAfter)
      );
      return getPaginatedSupaglueRecords<T>(
        result.rows,
        parseInt(total),
        pageSize,
        objectType === 'common' ? 'id' : '_supaglue_id',
        cursor
      );
    } finally {
      client.release();
    }
  }

  public async getStandardRecords(
    applicationId: string,
    providerName: ProviderName,
    customerId: string,
    objectName: string,
    cursorStr?: string,
    modifiedAfter?: string,
    pageSize = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedSupaglueRecords<SupaglueStandardRecord>> {
    return await this.#getRecords<SupaglueStandardRecord>(
      applicationId,
      getCategoryForProvider(providerName),
      providerName,
      customerId,
      objectName,
      'standard',
      cursorStr,
      modifiedAfter,
      pageSize
    );
  }

  public async getCrmAccountRecords(
    applicationId: string,
    providerName: ProviderName,
    customerId: string,
    cursorStr?: string,
    modifiedAfter?: string,
    pageSize = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedSupaglueRecords<SnakecasedKeysCrmAccount>> {
    return await this.#getRecords<SnakecasedKeysCrmAccount>(
      applicationId,
      'crm',
      providerName,
      customerId,
      'account',
      'common',
      cursorStr,
      modifiedAfter,
      pageSize
    );
  }

  public async getCrmContactRecords(
    applicationId: string,
    providerName: ProviderName,
    customerId: string,
    cursorStr?: string,
    modifiedAfter?: string,
    pageSize = DEFAULT_PAGE_SIZE
  ): Promise<PaginatedSupaglueRecords<SnakecasedKeysCrmContact>> {
    return await this.#getRecords<SnakecasedKeysCrmContact>(
      applicationId,
      'crm',
      providerName,
      customerId,
      'contact',
      'common',
      cursorStr,
      modifiedAfter,
      pageSize
    );
  }
}

const getCountSql = (qualifiedTable: string, customerId: string, objectType: ObjectType, modifiedAfter?: string) => {
  const lastModifiedAtCol = objectType === 'common' ? 'last_modified_at' : '_supaglue_last_modified_at';
  let sql = `SELECT COUNT(*) AS total FROM ${qualifiedTable} WHERE _supaglue_customer_id = '${customerId}'`;
  if (modifiedAfter) {
    sql += ` AND ${lastModifiedAtCol} > '${modifiedAfter}'`;
  }
  sql += ';';
  return sql;
};

const getSql = (
  qualifiedTable: string,
  customerId: string,
  objectType: ObjectType,
  limit: number,
  cursor?: Cursor,
  modifiedAfter?: string
) => {
  const idCol = objectType === 'common' ? 'id' : '_supaglue_id';
  const lastModifiedAtCol = objectType === 'common' ? 'last_modified_at' : '_supaglue_last_modified_at';
  let sql = `SELECT * FROM ${qualifiedTable} WHERE _supaglue_customer_id = '${customerId}'`;
  if (cursor) {
    sql += ` AND ${idCol} ${isForward(cursor) ? '>' : '<'} '${cursor.id}'`;
  }
  if (modifiedAfter) {
    sql += ` AND ${lastModifiedAtCol} > '${modifiedAfter}'`;
  }
  sql += ` ORDER BY ${idCol} ${isForward(cursor) ? 'ASC' : 'DESC'} LIMIT ${limit};`;
  return sql;
};
