import createClient from 'openapi-fetch';

import type { paths as actions } from './gen/v2/actions';
import type { paths as crm } from './gen/v2/crm';
import type { paths as data } from './gen/v2/data';
import type { paths as engagement } from './gen/v2/engagement';
import type { paths as enrichment } from './gen/v2/enrichment';
import type { paths as marketingAutomation } from './gen/v2/marketing-automation';
import type { paths as metadata } from './gen/v2/metadata';
import type { paths as mgmt } from './gen/v2/mgmt';
import type { paths as ticketing } from './gen/v2/ticketing';

// TODO: Publish this as @supaglue/sdk so our customers can use it too

interface SupaglueOptions {
  /** defaults to https://api.supaglue.io/ */
  apiUrl?: string;
  /** x-api-key header */
  apiKey: string;
}

export type SupaglueClient = ReturnType<typeof createSupaglueClient>;
export function createSupaglueClient({ apiUrl = 'https://api.supaglue.io', ...options }: SupaglueOptions) {
  const getOptions = (segment: string) =>
    ({
      baseUrl: new URL(segment, apiUrl).toString(),
      headers: { ['x-api-key']: options.apiKey },
    } satisfies Parameters<typeof createClient>[0]);

  return {
    actions: createClient<actions>(getOptions('actions/v2')),
    crm: createClient<crm>(getOptions('crm/v2')),
    data: createClient<data>(getOptions('data/v2')),
    engagement: createClient<engagement>(getOptions('engagement/v2')),
    enrichment: createClient<enrichment>(getOptions('enrichment/v2')),
    marketingAutomation: createClient<marketingAutomation>(getOptions('marketing-automation/v2')),
    metadata: createClient<metadata>(getOptions('metadata/v2')),
    ticketing: createClient<ticketing>(getOptions('ticketing/v2')),
    // TODO: Mgmt uses different headers, we should fix that
    mgmt: createClient<mgmt>(getOptions('mgmt/v2')),
  };
}
