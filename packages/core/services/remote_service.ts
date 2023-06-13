import { ConnectionUnsafe } from '@supaglue/types';
import { ProviderService } from '.';
import { logger } from '../lib';
import { getCrmRemoteClient } from '../remotes/crm';
import type { CrmRemoteClient } from '../remotes/crm/base';
import { getEngagementRemoteClient } from '../remotes/engagement';
import type { EngagementRemoteClient } from '../remotes/engagement/base';
import type { ConnectionService } from './connection_service';

export class RemoteService {
  #connectionService: ConnectionService;
  #providerService: ProviderService;

  public constructor(connectionService: ConnectionService, providerService: ProviderService) {
    this.#connectionService = connectionService;
    this.#providerService = providerService;
  }

  public async getRemoteClient(connectionId: string): Promise<CrmRemoteClient | EngagementRemoteClient> {
    const connection = await this.#connectionService.getUnsafeById(connectionId);
    const provider = await this.#providerService.getById(connection.providerId);

    if (connection.category !== provider.category) {
      throw new Error(
        `Connection category ${connection.category} does not match provider category ${provider.category}.`
      );
    }

    if (connection.providerName !== provider.name) {
      throw new Error(
        `Connection providerName ${connection.providerName} does not match provider providerName ${provider.name}.`
      );
    }

    if (!provider.config) {
      throw new Error('provider must have config');
    }

    let client: CrmRemoteClient | EngagementRemoteClient;
    if (provider.category === 'crm') {
      const { name } = provider;
      client = getCrmRemoteClient(connection as ConnectionUnsafe<typeof name>, provider);
    } else {
      const { name } = provider;
      client = getEngagementRemoteClient(connection as ConnectionUnsafe<typeof name>, provider);
    }

    // Persist the refreshed token
    client.on('token_refreshed', (accessToken: string, expiresAt: string | null) => {
      this.#connectionService
        .updateConnectionWithNewAccessToken(connectionId, accessToken, expiresAt)
        .catch((err: unknown) => {
          // TODO: Use logger
          // eslint-disable-next-line no-console
          logger.error({ err, connectionId }, `Failed to persist refreshed token`);
        });
    });

    return client;
  }
}
