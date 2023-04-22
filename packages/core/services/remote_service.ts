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

  public async getCrmRemoteClient(connectionId: string): Promise<CrmRemoteClient> {
    const connection = await this.#connectionService.getUnsafeById(connectionId);
    if (connection.category !== 'crm') {
      // TODO: fix this
      throw new Error('Connection must be of category "crm"');
    }

    const integration = await this.#integrationService.getById(connection.integrationId);
    if (integration.category !== 'crm') {
      // TODO: fix this
      throw new Error('Integration must be of category "crm"');
    }

    if (!integration.config) {
      throw new Error('Integration must have config');
    }

    const client = getCrmRemoteClient(connection, integration);

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

  public async getEngagementRemoteClient(connectionId: string): Promise<EngagementRemoteClient> {
    const connection = await this.#connectionService.getUnsafeById(connectionId);
    if (connection.category !== 'engagement') {
      // TODO: fix this
      throw new Error('Connection must be of category "engagement"');
    }

    const integration = await this.#integrationService.getById(connection.integrationId);
    if (integration.category !== 'engagement') {
      // TODO: fix this
      throw new Error('Integration must be of category "engagement"');
    }

    if (!integration.config) {
      throw new Error('Integration must have config');
    }

    const client = getEngagementRemoteClient(connection, integration);

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
