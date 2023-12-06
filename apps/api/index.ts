import initRoutes from '@/routes';
import { createTerminus } from '@godaddy/terminus';
import { SGError } from '@supaglue/core/errors';
import { expressScopeMiddleware, logger } from '@supaglue/core/lib';
import type { ResponseErrors } from '@supaglue/sdk';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';
import promBundle from 'express-prom-bundle';
import robots from 'express-robots-txt';
import pinoHttp from 'pino-http';
import { v4 as uuidv4 } from 'uuid';
import { getDependencyContainer } from './dependency_container';

const app = express();
app.set('trust proxy', true);
const metricsApp = express();
const port = process.env.SUPAGLUE_API_PORT ? parseInt(process.env.SUPAGLUE_API_PORT) : 8080;

if (process.env.GLOBAL_AGENT_HTTP_PROXY) {
  require('@supaglue/sdk/proxy.bootstrap');
}

app.use(
  robots({
    UserAgent: '*',
    Disallow: '/',
  })
);

app.use(
  promBundle({
    includeMethod: true,
    includePath: true,
    promClient: {
      collectDefaultMetrics: {},
    },
    autoregister: false,
    metricsApp,
    normalizePath: (req, opts) => {
      let path = promBundle.normalizePath(req, opts);

      const matched =
        path.match(/^(\/crm\/v2\/accounts\/).+/) ||
        path.match(/^(\/crm\/\/v2\/contacts\/).+/) ||
        path.match(/^(\/crm\/\/v2\/leads\/).+/) ||
        path.match(/^(\/crm\/\/v2\/opportunities\/).+/) ||
        path.match(/^(\/crm\/v2\/users\/).+/) ||
        path.match(/^(\/engagement\/v2\/contacts\/).+/) ||
        path.match(/^(\/engagement\/v2\/mailboxes\/).+/) ||
        path.match(/^(\/engagement\/v2\/sequence_states\/).+/) ||
        path.match(/^(\/engagement\/v2\/users\/).+/);
      if (matched) {
        path = `${matched[1]}/#val`;
      }

      return path;
    },
  })
);

app.use(expressScopeMiddleware());

// Body parsing Middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

//cors
app.use(
  cors({
    origin: process.env.SUPAGLUE_CORS_ORIGIN?.split(','),
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
    redact: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-api-key"]',
      'req.headers["x-sg-internal-token"]',
      'err.config.headers.Authorization', // axios errors
    ],
    genReqId: () => uuidv4(),
    quietReqLogger: true, // only log the reqId from req.log.*, not the whole request
  })
);

initRoutes(app);

// init the processSyncChanges schedule
const { connectionAndSyncService } = getDependencyContainer();
connectionAndSyncService.upsertProcessSyncChangesTemporalSchedule().catch((err) => {
  logger.error(err);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, req: Request, res: Response<{ errors: ResponseErrors }>, next: NextFunction) => {
  // add the error to the response so pino-http can log it
  res.err = err as Error;

  if (err instanceof SGError) {
    return res.status(err.httpCode).send({
      errors: [
        {
          id: req.id.toString(),
          title: err.message,
          detail: err.detail,
          problem_type: err.code,
          code: err.code,
          meta: { ...err.meta, application_name: req.supaglueApplication?.name },
          status: err.status.toString(),
        },
      ],
    });
  }

  return res.status(500).json({
    errors: [
      {
        id: req.id.toString(),
        title: 'Internal Server Error',
        detail: (err as any).message ?? 'Internal Server Error',
        problem_type: 'INTERNAL_SERVER_ERROR',
        code: 'INTERNAL_SERVER_ERROR',
        status: '500',
        meta: {
          origin: 'supaglue',
          cause: err as any,
          application_name: req.supaglueApplication?.name,
        },
      },
    ],
  });
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
  logger.info(`Server listening on port ${port}`);
});

server.keepAliveTimeout = process.env.SERVER_KEEP_ALIVE_TIMEOUT
  ? parseInt(process.env.SERVER_KEEP_ALIVE_TIMEOUT)
  : 121_000;
server.headersTimeout = server.keepAliveTimeout + 1000; // should be 1 second more than keepAliveTimeout, according to most sources
if (process.env.SERVER_TIMEOUT) {
  server.setTimeout(parseInt(process.env.SERVER_TIMEOUT));
}

const metricsServer = metricsApp.listen(9090, (): void => {
  logger.info('Metrics server listening on port 9090');
});

createTerminus(server, {
  healthChecks: {
    '/health': async () => {
      return;
    },
  },
  timeout: 10000,
  beforeShutdown: async () => {
    logger.info('Server is shutting down');
    metricsServer.close();
  },
  onShutdown: async () => {
    logger.info('Server is shut down');
  },
  useExit0: true,
  logger: (message, error) => logger.error(error, message),
});
