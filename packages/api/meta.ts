import { initTRPC } from '@trpc/server';
import type { OpenApiMeta } from '@usevenice/trpc-openapi';
import { z } from 'zod';
import { extendZodWithOpenApi } from 'zod-openapi';

extendZodWithOpenApi(z);

export { z };

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
export const t = initTRPC.meta<OpenApiMeta>().create();
