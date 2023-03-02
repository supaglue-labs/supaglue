import { getCrmRemoteClient } from '../remotes/crm';
import { CrmRemoteClient } from '../remotes/crm/base';
import { ConnectionService } from './connection_service';
import { IntegrationService } from './integration_service';

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

    return getCrmRemoteClient(connection, integration);
  }
}
