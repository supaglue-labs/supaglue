import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // log: ['query'],
});

export * from '@prisma/client';
export default prisma;

// TODO: Shouldn't be hard-coding the DB schema here.
export const COMMON_MODEL_DB_TABLES = {
  contacts: 'api.crm_contacts',
  accounts: 'api.crm_accounts',
  leads: 'api.crm_leads',
  opportunities: 'api.crm_opportunities',
};
