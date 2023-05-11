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
  crm: {
    contacts: `${schemaPrefix}crm_contacts`,
    accounts: `${schemaPrefix}crm_accounts`,
    leads: `${schemaPrefix}crm_leads`,
    opportunities: `${schemaPrefix}crm_opportunities`,
    users: `${schemaPrefix}crm_users`,
    events: `${schemaPrefix}crm_events`,
  },
  engagement: {
    contacts: `${schemaPrefix}engagement_contacts`,
    sequence_states: `${schemaPrefix}engagement_sequence_states`,
    users: `${schemaPrefix}engagement_users`,
    sequences: `${schemaPrefix}engagement_sequences`,
    mailboxes: `${schemaPrefix}engagement_mailboxes`,
  },
};
