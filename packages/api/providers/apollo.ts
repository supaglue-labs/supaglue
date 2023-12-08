/* eslint-disable no-console */
import type { EngagementProvider } from '../routers/engagement';

export function createApolloProvider() {
  return {
    logCall: (input) => {
      console.log('Call ID:', input);
      return { id: '1', note: 'test', contact_id: '1' };
    },
  } satisfies EngagementProvider;
}
