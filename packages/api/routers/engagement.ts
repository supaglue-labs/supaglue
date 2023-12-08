import { TRPCError } from '@trpc/server';
import type { MaybePromise } from '../meta';
import { remoteProcedure, t, z } from '../meta';

const schemas = {
  logCallInput: z.object({
    contact_id: z.string(),
  }),
  call: z
    .object({
      id: z.string(),
      note: z.string(),
      contact_id: z.string(),
    })
    .openapi({ ref: 'Call' }),
};

export interface EngagementProvider {
  logCall: (input: z.infer<typeof schemas.logCallInput>) => MaybePromise<z.infer<typeof schemas.call>>;
}

export const engagementRouter = t.router({
  logCall: remoteProcedure
    .meta({ openapi: { method: 'POST', path: '/engagement/v2/calls' } })
    .input(schemas.logCallInput)
    .output(z.object({ record: schemas.call }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.provider?.logCall) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
      }
      return { record: await ctx.provider?.logCall(input) };
    }),
});
