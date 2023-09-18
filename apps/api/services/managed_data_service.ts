import { BadRequestError } from '@supaglue/core/errors';
import type { Cursor, PaginatedSupaglueRecords, SupaglueRecord } from '@supaglue/core/lib';
import {
  decodeCursor,
  getObjectTableName,
  getPaginatedSupaglueRecords,
  getPgPool,
  getSchemaName,
  isForward,
  MAX_PAGE_SIZE,
} from '@supaglue/core/lib';
import type { ProviderName } from '@supaglue/types';
import type { Pool, PoolClient } from 'pg';

export class ManagedDataService {
  #pgPool: Pool;
  constructor() {
    this.#pgPool = getPgPool(process.env.SUPAGLUE_MANAGED_DATABASE_URL!);
  }

  async #getClient(): Promise<PoolClient> {
    return await this.#pgPool.connect();
  }

  public async getRecords(
    applicationId: string,
    providerName: ProviderName,
    customerId: string,
    objectName: string,
    cursorStr?: string,
    modifiedAfter?: string,
    pageSize = MAX_PAGE_SIZE
  ): Promise<PaginatedSupaglueRecords> {
    if (pageSize < 1) {
      throw new BadRequestError('Page size must be greater than 0');
    }
    if (pageSize > MAX_PAGE_SIZE) {
      throw new BadRequestError(`Page size cannot exceed ${MAX_PAGE_SIZE}`);
    }
    const cursor = cursorStr ? decodeCursor(cursorStr) : undefined;
    const schema = getSchemaName(applicationId);
    const table = getObjectTableName(providerName, objectName);
    const qualifiedTable = `${schema}.${table}`;
    const client = await this.#getClient();
    try {
      const { rows } = await client.query<{ total: string }>(getCountSql(qualifiedTable, customerId, modifiedAfter));
      if (!rows.length) {
        throw new Error('No rows returned from count query');
      }
      const { total } = rows[0];
      // We fetch `pageSize + 1` records so we know if we need to return a `next` pagination.
      const result = await client.query<SupaglueRecord>(
        getSql(qualifiedTable, customerId, pageSize + 1, cursor, modifiedAfter)
      );
      return getPaginatedSupaglueRecords(result.rows, parseInt(total), pageSize, cursor);
    } finally {
      client.release();
    }
  }
}

const getCountSql = (qualifiedTable: string, customerId: string, modifiedAfter?: string) => {
  let sql = `SELECT COUNT(*) AS total FROM ${qualifiedTable} WHERE _supaglue_customer_id = '${customerId}'`;
  if (modifiedAfter) {
    sql += ` AND _supaglue_last_modified_at > '${modifiedAfter}'`;
  }
  sql += ';';
  return sql;
};

const getSql = (qualifiedTable: string, customerId: string, limit: number, cursor?: Cursor, modifiedAfter?: string) => {
  let sql = `SELECT * FROM ${qualifiedTable} WHERE _supaglue_customer_id = '${customerId}'`;
  if (cursor) {
    sql += ` AND _supaglue_id ${isForward(cursor) ? '>' : '<'} '${cursor.id}'`;
  }
  if (modifiedAfter) {
    sql += ` AND _supaglue_last_modified_at > '${modifiedAfter}'`;
  }
  sql += ` ORDER BY _supaglue_id ${isForward(cursor) ? 'ASC' : 'DESC'} LIMIT ${limit};`;
  return sql;
};
