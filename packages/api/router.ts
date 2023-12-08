import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createOpenApiExpressMiddleware, generateOpenApiDocument } from '@usevenice/trpc-openapi';
import express from 'express';
import { renderTrpcPanel } from 'trpc-panel';
import { z } from 'zod';
import { createContext, t } from './context';
import { engagementRouter } from './routers/engagement';

export const metaRouter = t.router({
  getOpenApiSpec: t.procedure
    .meta({ openapi: { method: 'GET', path: '/openapi.json' } })
    .input(z.void())
    .output(z.unknown())
    .query(() => openApiSpec),
});

export const appRouter = t.mergeRouters(t.router({ engagement: engagementRouter }), metaRouter);

const port = 3000;

export const openApiSpec = generateOpenApiDocument(appRouter, {
  title: 'Supaglue OpenAPI',
  openApiVersion: '3.1.0',
  version: '0.0.1',
  baseUrl: `http://localhost:${port}`,
});

if (require.main === module) {
  // openapi server, running in the Docker container with express
  const app = express();
  app.get('/', (_req, res) => {
    res.send('Our current API routes');
  });
  app.use(
    createOpenApiExpressMiddleware({
      router: appRouter,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createContext: ({ req }) => createContext({ headers: req.headers }),
    })
  );

  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on port ${port}`);
  });

  // trpc server, running in api routes in next.js for our internal management ui use
  createHTTPServer({
    router: appRouter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createContext: ({ req }) => createContext({ headers: req.headers }),
    middleware(req, res, next) {
      if (req.url === '/_panel') {
        res.end(renderTrpcPanel(appRouter, { url: 'http://localhost:3001' }));
        return;
      }
      next();
    },
  }).listen(3001);
}
