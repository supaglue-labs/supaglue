import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export * from '@prisma/client';
export { schemaPrefix };
export default prisma;

const databaseUrl = new URL(process.env.SUPAGLUE_DATABASE_URL!);
const schema = databaseUrl.searchParams.get('schema');

let schemaPrefix = '';
if (schema) {
  schemaPrefix = `${schema}.`;
}

export const COMMON_MODEL_DB_TABLES = {
  contacts: `${schemaPrefix}crm_contacts`,
  accounts: `${schemaPrefix}crm_accounts`,
  leads: `${schemaPrefix}crm_leads`,
  opportunities: `${schemaPrefix}crm_opportunities`,
  users: `${schemaPrefix}crm_users`,
};
