import { TRPCError } from '@trpc/server';
import type { MaybePromise } from '../context';
import { remoteProcedure, t, z } from '../context';

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
  contact: z
    .object({
      id: z.string(),
      email: z.string(),
      first_name: z.string(),
      last_name: z.string(),
    })
    .openapi({ ref: 'Contact' }),
};

export interface EngagementProvider {
  contacts: {
    get: (id: string) => MaybePromise<z.infer<typeof schemas.contact>>;
  };
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
  getContact: remoteProcedure
    .meta({ openapi: { method: 'GET', path: '/engagement/v2/contacts/{id}' } })
    .input(z.object({ id: z.string() }))
    .output(z.object({ record: schemas.contact }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.provider?.contacts.get) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
      }
      return { record: await ctx.provider?.contacts.get(input.id) };
    }),
});
