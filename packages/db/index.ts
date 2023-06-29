import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export * from '@prisma/client';
export default prisma;

const databaseUrl = new URL(process.env.SUPAGLUE_DATABASE_URL!);
const schema = databaseUrl.searchParams.get('schema');

let schemaPrefix = '';
if (schema) {
  schemaPrefix = `${schema}.`;
}

export const OBJECT_SYNC_CHANGES_TABLE = `${schemaPrefix}object_sync_changes`;
export const OBJECT_SYNCS_TABLE = `${schemaPrefix}object_syncs`;
export const CONNECTIONS_TABLE = `${schemaPrefix}connections`;
