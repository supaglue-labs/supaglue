import { ConnectionUnsafe } from '@supaglue/types';
import { RemoteClient } from '../remotes/base';
import { getCrmRemoteClient } from '../remotes/crm';
import type { CrmRemoteClient } from '../remotes/crm/base';
import { getEngagementRemoteClient } from '../remotes/engagement';
import { EngagementRemoteClient } from '../remotes/engagement/base';
import type { ConnectionService } from './connection_service';
import type { IntegrationService } from './integration_service';

export class RemoteService {
  #connectionService: ConnectionService;
  #integrationService: IntegrationService;

  public constructor(connectionService: ConnectionService, integrationService: IntegrationService) {
    this.#connectionService = connectionService;
    this.#integrationService = integrationService;
  }

  public async getRemoteClient(connectionId: string): Promise<RemoteClient> {
    const connection = await this.#connectionService.getUnsafeById(connectionId);
    const integration = await this.#integrationService.getById(connection.integrationId);

    if (connection.category !== integration.category) {
      throw new Error(
        `Connection category ${connection.category} does not match integration category ${integration.category}.`
      );
    }

    if (connection.providerName !== integration.providerName) {
      throw new Error(
        `Connection providerName ${connection.providerName} does not match integration providerName ${integration.providerName}.`
      );
    }

    if (!integration.config) {
      throw new Error('Integration must have config');
    }

    let client: CrmRemoteClient | EngagementRemoteClient;
    if (integration.category === 'crm') {
      const { providerName } = integration;
      client = getCrmRemoteClient(connection as ConnectionUnsafe<typeof providerName>, integration);
    } else {
      const { providerName } = integration;
      client = getEngagementRemoteClient(connection as ConnectionUnsafe<typeof providerName>, integration);
    }

    // Persist the refreshed token
    client.on('token_refreshed', (accessToken: string, expiresAt: string | null) => {
      this.#connectionService
        .updateConnectionWithNewAccessToken(connectionId, accessToken, expiresAt)
        .catch((err: unknown) => {
          // TODO: Use logger
          // eslint-disable-next-line no-console
          console.error(`Failed to persist refreshed token for connection ${connectionId}`, err);
        });
    });

    return client;
  }
}
