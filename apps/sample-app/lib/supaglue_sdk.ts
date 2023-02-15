import prisma from './prismadb';

// Separately: modify .prisma/client/index.d.ts and add a crmContact interface
prisma.crmContact = prisma.salesforceContact;

export default prisma;
export * from '@prisma/client';
