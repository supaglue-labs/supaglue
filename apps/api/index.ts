import { createTerminus } from '@godaddy/terminus';
import { RewriteFrames } from '@sentry/integrations';
import * as Sentry from '@sentry/node';
import { NativeConnection, Runtime, Worker } from '@temporalio/worker';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import { HTTPError } from './errors';
import { client as posthogClient } from './lib/posthog';
import { logger } from './logger';
import initRoutes from './routes';
import { TEMPORAL_SYNC_TASKS_TASK_QUEUE } from './temporal';
import * as activities from './temporal/activities';

// Uncomment if you want to test pubsub
// import { subscribe } from './salesforce_pubsub/client';

const sentryEnabled = !(process.env.SUPAGLUE_DISABLE_ERROR_REPORTING || process.env.CI);
const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

if (sentryEnabled) {
  Sentry.init({
    // this is the public DSN for the project in sentry, so it's safe and expected to be committed, per Sentry's CTO:
    // https://github.com/getsentry/sentry-docs/pull/1723#issuecomment-781041906
    dsn: 'https://606fd8535f1c409ea96805e46f3add57@o4504573112745984.ingest.sentry.io/4504573114777600',
    integrations: [
      new RewriteFrames({
        root: __dirname,
      }),
    ],
    release: version,
  });
}

const app = express();
const port = process.env.SUPAGLUE_API_PORT ? parseInt(process.env.SUPAGLUE_API_PORT) : 8080;

app.use(Sentry.Handlers.requestHandler());
// Body parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cors
app.use(
  cors({
    origin: process.env.SUPAGLUE_CORS_ORIGIN,
    credentials: true,
  })
);

app.use(
  pinoHttp({
    logger,
    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500 || err) {
        return 'error';
      }
      return 'info';
    },
    customSuccessMessage: function (req, res) {
      if (res.statusCode === 404) {
        return `${req.method} ${(req as Request).originalUrl} not found`;
      }
      return `${req.method} ${(req as Request).originalUrl}`;
    },
    customErrorMessage: function (req) {
      return `${req.method} ${(req as Request).originalUrl}`;
    },
    serializers: {
      req: (req) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { cookie, authorization, ...headers } = req.headers;
        return { ...req, headers };
      },
    },
    genReqId: () => uuidv4(),
    quietReqLogger: true, // only log the reqId from req.log.*, not the whole request
  })
);

initRoutes(app);

// error handling middlewares
app.use(
  Sentry.Handlers.errorHandler({
    shouldHandleError: (error) => {
      if (error instanceof HTTPError && error.code < 500) {
        return false;
      }
      return true;
    },
  })
);
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HTTPError) {
    return res.status(err.code).send(`${err.message} - Error id: ${(res as any).sentry}`);
  }

  return next(err);
});

const server = app.listen(port, (): void => {
  if (!process.env.DISABLE_BANNER) {
    logger.info(`
 _______           _______  _______  _______  _                 _______
(  ____ \\|\\     /|(  ____ )(  ___  )(  ____ \\( \\      |\\     /|(  ____ \\
| (    \\/| )   ( || (    )|| (   ) || (    \\/| (      | )   ( || (    \\/
| (_____ | |   | || (____)|| (___) || |      | |      | |   | || (__
(_____  )| |   | ||  _____)|  ___  || | ____ | |      | |   | ||  __)
      ) || |   | || (      | (   ) || | \\_  )| |      | |   | || (
/\\____) || (___) || )      | )   ( || (___) || (____/\\| (___) || (____/\\
\\_______)(_______)|/       |/     \\|(_______)(_______/(_______)(_______/`);
  }
  logger.info(`Connected successfully at http://localhost:${port}`);
});

// TODO: We should deploy Temporal worker in another process later.
// Bundling this with api for now to keep things simple.
// Set up Temporal worker
void (async () => {
  Runtime.install({
    // don't listen on any signals since we are using terminus to handle the shutdown
    shutdownSignals: [],
    logger: {
      info: (message) => logger.info(message),
      warn: (message) => logger.warn(message),
      error: (message) => logger.error(message),
      log: (message) => logger.info(message),
      trace: (message) => logger.trace(message),
      debug: (message) => logger.debug(message),
    },
  });
  const connection = await NativeConnection.connect({
    address: 'temporal',
  });

  const worker = await Worker.create({
    workflowsPath: require.resolve('./temporal/workflows'),
    activities,
    taskQueue: TEMPORAL_SYNC_TASKS_TASK_QUEUE,
    connection,
  });

  // Uncomment if you want to test pubsub
  // try {
  //   await subscribe({ customerId: 'user1', topicName: '/data/ContactChangeEvent' });
  // } catch (e) {
  //   logger.error(e, 'Could not subscribe to topic');
  // }

  // set up terminus here since we need the worker
  createTerminus(server, {
    healthChecks: {
      '/health': async () => {
        return;
      },
    },
    timeout: 10000,
    beforeShutdown: async () => {
      logger.info('Server is shutting down');
      await posthogClient.shutdownAsync();
      worker.shutdown();
    },
    onShutdown: async () => {
      logger.info('Server is shut down');
    },
    useExit0: true,
    logger: (message, error) => logger.error(error, message),
  });

  // must come last since it blocks
  await worker.run();
})();
