import { getCrmRemoteClient } from '../remotes/crm';
import type { CrmRemoteClient } from '../remotes/crm/base';
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
    const connection = await this.#connectionService.getById(connectionId);
    const integration = await this.#integrationService.getById(connection.integrationId);

    const client = getCrmRemoteClient(connection, integration);

    // Persist the refreshed token
    client.on('token_refreshed', (accessToken: string, expiresAt: string) => {
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
