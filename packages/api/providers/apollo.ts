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
      logCall: (input) => {
        console.log('Call ID:', input);
        return { id: '1', note: 'test', contact_id: '1' };
      },
    } satisfies EngagementProvider;
  });
