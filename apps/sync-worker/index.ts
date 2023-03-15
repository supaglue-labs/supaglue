import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { logger } from '@supaglue/core/lib';
import { distinctId } from '@supaglue/core/lib/distinct_identifier';
import { createActivities } from '@supaglue/sync-workflows';
import { SYNC_TASK_QUEUE } from '@supaglue/sync-workflows/constants';
import { LogLevel, LogMetadata, NativeConnection, Runtime, Worker } from '@temporalio/worker';
import fs from 'fs';
import path from 'path';
import { getDependencyContainer } from './dependency_container';

const sentryEnabled = !(process.env.SUPAGLUE_DISABLE_ERROR_REPORTING || process.env.CI);
const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

if (sentryEnabled) {
  Sentry.init({
    dsn: 'https://168e6ed7afc74379ba0608da6173649c@o4504573112745984.ingest.sentry.io/4504844378505216',
    integrations: [
      new RewriteFrames({
        root: __dirname,
      }),
    ],
    release: version,
    includeLocalVariables: true,
    initialScope: {
      user: {
        id: distinctId,
      },
    },
  });
}

async function run() {
  // pino expects errors to be placed under the `err` key. We're doing mapping here
  // instead of configuring it in `logger.ts` because we may use the pino logger
  // elsewhere in this app ourselves.
  // TODO: come up with better way to deal with this?

  const transformMeta = (meta?: LogMetadata): LogMetadata | undefined => {
    if (!meta) {
      return meta;
    }

    const { error, ...rest } = meta;
    if (!error) {
      return meta;
    }

    // TODO: don't assume that `error` is an error object
    return {
      ...rest,
      err: error,
    };
  };

  Runtime.install({
    logger: {
      info: (message: string, meta?: LogMetadata) => logger.info(transformMeta(meta), message),
      warn: (message: string, meta?: LogMetadata) => logger.warn(transformMeta(meta), message),
      error: (message: string, meta?: LogMetadata) => logger.error(transformMeta(meta), message),
      log: (level: LogLevel, message: string, meta?: LogMetadata) => logger.info(transformMeta(meta), message),
      trace: (message: string, meta?: LogMetadata) => logger.trace(transformMeta(meta), message),
      debug: (message: string, meta?: LogMetadata) => logger.debug(transformMeta(meta), message),
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
