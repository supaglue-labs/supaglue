import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export * from '@prisma/client';
export default prisma;
