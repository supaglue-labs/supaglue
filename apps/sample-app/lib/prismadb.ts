import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Ensure the prisma instance is re-used during hot-reloading
// Otherwise, a new client will be created on every reload
const client = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = client;
}

export default client;
export * from '@prisma/client';
