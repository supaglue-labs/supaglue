/* eslint-disable @typescript-eslint/no-explicit-any */
import { initTRPC } from '@trpc/server';
import type { OpenApiMeta } from '@usevenice/trpc-openapi';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';
import { createApolloProvider } from './providers/apollo';

extendZodWithOpenApi(z);

export { z };

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC
  .context<{ headers: { 'x-api-key': string; 'x-customer-id': string; 'x-provider-name': string } }>()
  .meta<OpenApiMeta>()
  .create();

export const remoteProcedure = t.procedure.use(async ({ next, ctx }) => {
  // if (!ctx.headers['x-customer-id']) {
  //   throw new TRPCError({
  //     code: 'BAD_REQUEST',
  //     message: 'x-customer-id header is required',
  //   });
  // }

  const provider = createApolloProvider();

  return next({
    ctx: { ...ctx, path: (ctx as any).path as string, provider, providerName: ctx.headers['x-provider-name'] },
  });
});
export type RemoteProcedureContext = ReturnType<(typeof remoteProcedure)['query']>['_def']['_ctx_out'];

export type MaybePromise<T> = T | Promise<T>;
