import type { EntitiesWhitelist, SchemasWhitelist } from '@/utils/lekko';
import { ClientContext, initAPIClient } from '@lekko/node-server-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';
import { LEKKO_API_KEY } from '../..';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      // Default values
      let entitiesWhitelistConfig: EntitiesWhitelist = {
        applicationIds: [],
      };
      let schemasWhitelistConfig: SchemasWhitelist = {
        applicationIds: [],
      };

      if (LEKKO_API_KEY) {
        const lekkoClient = await initAPIClient({
          apiKey: LEKKO_API_KEY,
          repositoryName: 'supaglue-test',
          repositoryOwner: 'lekkodev',
        });

        try {
          const fetchEntitiesWhitelistConfig = lekkoClient.getJSON(
            'mgmt-ui',
            'entities_whitelist',
            new ClientContext()
          );
          const fetchSchemasWhitelistConfig = lekkoClient.getJSON('mgmt-ui', 'schemas_whitelist', new ClientContext());

          [entitiesWhitelistConfig, schemasWhitelistConfig] = await Promise.all([
            fetchEntitiesWhitelistConfig,
            fetchSchemasWhitelistConfig,
          ]);
        } catch {
          // For now, handle failures silently by returning above defaults
        }
      }

      return res.status(200).json({
        entitiesWhitelistConfig,
        schemasWhitelistConfig,
      });
    }
  }
}
