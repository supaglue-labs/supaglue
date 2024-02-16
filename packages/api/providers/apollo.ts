/* eslint-disable no-console */
import { createApolloClient } from '@supaglue/core/remotes/impl/apollo/apollo.client';
import { z } from '../context';
import type { EngagementProvider } from '../routers/engagement';

export const createApolloProvider = z
  .function()
  .args(z.object({ apiKey: z.string() }))
  .implement((opts) => {
    const apollo = createApolloClient(opts);
    return {
      contacts: {
        get: (id) =>
          apollo.GET('/v1/contacts/{id}', { params: { path: { id } } }).then(({ data: { contact } }) => contact),
      },
      logCall: async (input) => {
        console.log('log call input:', input);
        return { id: '1', note: 'test', contact_id: '1' };
      },
    } satisfies EngagementProvider;
  });
