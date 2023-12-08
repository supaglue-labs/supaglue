import { t, z } from '../meta';

const schemas = {
  call: z
    .object({
      id: z.string(),
      note: z.string(),
      contact_id: z.string(),
    })
    .openapi({ ref: 'Call' }),
};

export const engagementRouter = t.router({
  logCall: t.procedure
    .meta({ openapi: { method: 'POST', path: '/calls' } })
    .input(z.object({ contactId: z.string() }))
    .output(z.object({ record: schemas.call }))
    .mutation((input) => {
      console.log('Call ID:', input);
      return { record: { id: '1', note: 'test', contact_id: '1' } };
    }),
});
