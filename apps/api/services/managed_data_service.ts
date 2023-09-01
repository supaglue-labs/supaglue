import { getObjectTableName, getPgPool, getSchemaName } from '@supaglue/core/lib';
import type { ProviderName } from '@supaglue/types';
import type { Pool, PoolClient } from 'pg';

const LIMIT = 10;

type Cursor = {
  direction: 'forward' | 'backward';
  id: string;
};

// Function to encode a Cursor object to a minimal 64-bit string
const encodeCursor = (cursor: Cursor): string => {
  const cursorString = `d=${cursor.direction === 'forward' ? 1 : 0}&id=${encodeURIComponent(cursor.id)}`;
  const buffer = Buffer.from(cursorString, 'utf-8');
  return buffer.toString('base64');
};

// Function to decode a minimal 64-bit string back to a Cursor object
const decodeCursor = (encoded: string): Cursor => {
  // Decode the Base64 string to a Buffer and then to a string
  const buffer = Buffer.from(encoded, 'base64');
  const cursorString = buffer.toString('utf-8');

  // Parse the string back into a Cursor object
  const params = new URLSearchParams(cursorString);
  const direction = params.get('d') === '1' ? 'forward' : 'backward';
  const id = params.get('id') || '';

  return { direction, id };
};

type PaginatedRecords = {
  pagination?: {
    previous?: Cursor;
    next?: Cursor;
  };
  results: SupaglueRecord[];
};

type SupaglueRecord = {
  _supaglue_application_id: string;
  _supaglue_provider_name: ProviderName;
  _supaglue_customer_id: string;
  _supaglue_id: string;
  _supaglue_emitted_at: Date;
  _supaglue_last_modified_at: Date;
  _supaglue_is_deleted: boolean;
  _supaglue_raw_data: Record<string, unknown>;
};

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
    cursor?: Cursor,
    modifiedAfter?: Date
  ): Promise<PaginatedRecords> {
    const schema = getSchemaName(applicationId);
    const table = getObjectTableName(providerName, objectName);
    const qualifiedTable = `${schema}.${table}`;
    const client = await this.#getClient();
    try {
      const result = await client.query<SupaglueRecord>(
        getSql(qualifiedTable, customerId, LIMIT + 1, cursor, modifiedAfter)
      );
      if (result.rows.length === LIMIT + 1) {
        const results = isForward(cursor) ? result.rows.slice(0, LIMIT) : result.rows.slice(1).reverse();
        if (isForward(cursor)) {
          return {
            pagination: {
              next: { direction: 'forward', id: result.rows[LIMIT]._supaglue_id },
              previous: { direction: 'backward', id: result.rows[0]._supaglue_id },
            },
            results,
          };
        }
        return {
          pagination: {
            next: { direction: 'forward', id: result.rows[LIMIT]._supaglue_id },
            previous: { direction: 'backward', id: result.rows[0]._supaglue_id },
          },
          results,
        };
      }
      if (isForward(cursor)) {
        return {
          pagination: {
            previous: { direction: 'backward', id: result.rows[0]._supaglue_id },
          },
          results: result.rows,
        };
      }
      return {
        pagination: {
          next: { direction: 'forward', id: result.rows[LIMIT - 1]._supaglue_id },
        },
        results: result.rows.reverse(),
      };
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      client.release();
    }
  }
}

const getSql = (qualifiedTable: string, customerId: string, limit: number, cursor?: Cursor, modifiedAfter?: Date) => {
  let sql = `SELECT * FROM ${qualifiedTable} WHERE _supaglue_customer_id = '${customerId}'`;
  if (cursor) {
    sql += ` AND _supaglue_id ${isForward(cursor) ? '>' : '<'} '${cursor.id}'`;
  }
  if (modifiedAfter) {
    sql += ` AND _supaglue_last_modified_at > ${modifiedAfter.toISOString()}`;
  }
  sql += ` ORDER BY _supaglue_id ${isForward(cursor) ? 'ASC' : 'DESC'} LIMIT ${limit};`;
  return sql;
};

const isForward = (cursor?: Cursor): boolean => !cursor || cursor.direction === 'forward';
