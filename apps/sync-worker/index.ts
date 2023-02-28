import { createActivities } from '@supaglue/sync-workflows';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import { NativeConnection, Runtime, Worker } from '@temporalio/worker';
import { getDependencyContainer } from './dependency_container';
import { logger } from './logger';

async function run() {
  Runtime.install({
    logger: {
      info: (message, meta) => logger.info(meta, message),
      warn: (message, meta) => logger.warn(meta, message),
      error: (message, meta) => logger.error(meta, message),
      log: (message, meta) => logger.info(meta, message),
      trace: (message, meta) => logger.trace(meta, message),
      debug: (message, meta) => logger.debug(meta, message),
    },
  });

  const connection = await NativeConnection.connect({
    address: 'temporal',
  });

  const worker = await Worker.create({
    workflowsPath: require.resolve('@supaglue/sync-workflows/workflows'),
    activities: createActivities(getDependencyContainer()),
    taskQueue: SYNC_TASK_QUEUE,
    connection,
  });

  await worker.run();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
