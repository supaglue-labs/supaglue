import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import { renderTrpcPanel } from 'trpc-panel';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.create();

export const appRouter = t.router({
  hello: t.procedure.query(() => 'world'),
});

if (require.main === module) {
  createHTTPServer({
    router: appRouter,
    middleware(req, res, next) {
      if (req.url === '/_panel') {
        res.end(renderTrpcPanel(appRouter, { url: 'http://localhost:3000' }));
        return;
      }
      next();
    },
  }).listen(3000);
}
