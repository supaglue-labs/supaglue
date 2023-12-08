import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { createOpenApiHttpHandler, generateOpenApiDocument } from '@usevenice/trpc-openapi';
import http from 'http';
import { renderTrpcPanel } from 'trpc-panel';
import { z } from 'zod';
import { createContext, t } from './context';
import { engagementRouter } from './routers/engagement';

export const metaRouter = t.router({
  hello: t.procedure
    .meta({ openapi: { method: 'GET', path: '/hello' } })
    .input(z.void())
    .output(z.string())
    .query(() => 'world'),
  getOpenApiSpec: t.procedure
    .meta({ openapi: { method: 'GET', path: '/openapi.json' } })
    .input(z.void())
    .output(z.unknown())
    .query(() => openApiSpec),
});

export const appRouter = t.mergeRouters(t.router({ engagement: engagementRouter }), metaRouter);

export const openApiSpec = generateOpenApiDocument(appRouter, {
  title: 'Supaglue OpenAPI',
  openApiVersion: '3.1.0',
  version: '0.0.1',
  baseUrl: 'http://localhost:3000',
});

if (require.main === module) {
  // trpc server
  createHTTPServer({
    router: appRouter,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createContext: ({ req }) => createContext({ headers: req.headers }),
    middleware(req, res, next) {
      if (req.url === '/_panel') {
        res.end(renderTrpcPanel(appRouter, { url: 'http://localhost:3000' }));
        return;
      }
      next();
    },
  }).listen(3000);

  // openapi server
  http
    .createServer(
      createOpenApiHttpHandler({
        router: appRouter,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        createContext: ({ req }) => createContext({ headers: req.headers }),
      })
    )
    .listen(3001);
}
