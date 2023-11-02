// Generates 1MM sync runs for a given syncId
// Usage: SUPAGLUE_DATABASE_URL=postgres://postgres:supaglue@localhost:5432/postgres?schema=api npx ts-node ./scripts/generate_sync_runs.ts <syncId>

import prisma from '@supaglue/db';
import cuid from 'cuid';

if (process.argv.length < 3) {
  console.log(
    'Local usage: SUPAGLUE_DATABASE_URL=postgres://postgres:supaglue@localhost:5432/postgres?schema=api npx ts-node ./scripts/generate_sync_runs.ts <syncId>'
  );
  process.exit();
}

async function run() {
  for (let i = 0; i < 1000000; i++) {
    await prisma.syncRun.create({
      data: {
        id: cuid(),
        status: 'SUCCESS',
        syncId: process.argv[2],
        startTimestamp: new Date(),
        endTimestamp: new Date(),
      },
    });
  }
}

void run();
