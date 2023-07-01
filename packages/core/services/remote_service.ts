import type { ConnectionUnsafe } from '@supaglue/types';
import type { ProviderService } from '.';
import { InternalServerError } from '../errors';
import { logger } from '../lib';
import { getRemoteClient } from '../remotes';
import type { RemoteClient } from '../remotes/base';
import { getCrmRemoteClient } from '../remotes/categories/crm';
import type { CrmRemoteClient } from '../remotes/categories/crm/base';
import { getEngagementRemoteClient } from '../remotes/categories/engagement';
import type { EngagementRemoteClient } from '../remotes/categories/engagement/base';
import type { ConnectionService } from './connection_service';

export class RemoteService {
  #connectionService: ConnectionService;
  #providerService: ProviderService;

  public constructor(connectionService: ConnectionService, providerService: ProviderService) {
    this.#connectionService = connectionService;
    this.#providerService = providerService;
  }

  // TODO: Abstract some of the logic in these methods into a common method

  public async getCrmRemoteClient(connectionId: string): Promise<CrmRemoteClient> {
    const connection = await this.#connectionService.getUnsafeById(connectionId);
    const provider = await this.#providerService.getById(connection.providerId);

    if (connection.category !== 'crm' || provider.category !== 'crm') {
      throw new Error(`Connection or provider category was unexpectedly not 'crm'`);
    }

    if (connection.providerName !== provider.name) {
      throw new InternalServerError(
        `Connection providerName ${connection.providerName} unexpectedly does not match provider providerName ${provider.name}.`
      );
    }

    const client = getCrmRemoteClient(connection as ConnectionUnsafe<typeof provider.name>, provider);
    this.#persistRefreshedToken(connectionId, client);
    return client;
  }

  public async getEngagementRemoteClient(connectionId: string): Promise<EngagementRemoteClient> {
    const connection = await this.#connectionService.getUnsafeById(connectionId);
    const provider = await this.#providerService.getById(connection.providerId);

    if (connection.category !== 'engagement' || provider.category !== 'engagement') {
      throw new Error(`Connection or provider category was unexpectedly not 'engagement'`);
    }

    if (connection.providerName !== provider.name) {
      throw new InternalServerError(
        `Connection providerName ${connection.providerName} unexpectedly does not match provider providerName ${provider.name}.`
      );
    }

    if (!provider.config) {
      throw new Error('provider must have config');
    }

    const client = getEngagementRemoteClient(connection as ConnectionUnsafe<typeof provider.name>, provider);
    this.#persistRefreshedToken(connectionId, client);
    return client;
  }

  public async getRemoteClient(connectionId: string): Promise<RemoteClient> {
    const connection = await this.#connectionService.getUnsafeById(connectionId);
    const provider = await this.#providerService.getById(connection.providerId);

    if (connection.category !== provider.category) {
      throw new InternalServerError(
        `Connection and provider categories unexpectedly did not match: ${connection.category} !== ${provider.category}`
      );
    }

    if (connection.providerName !== provider.name) {
      throw new InternalServerError(
        `Connection providerName ${connection.providerName} unexpectedly does not match provider providerName ${provider.name}.`
      );
    }

    if (!provider.config) {
      throw new Error('provider must have config');
    }

    const client = getRemoteClient(connection as ConnectionUnsafe<typeof provider.name>, provider);
    this.#persistRefreshedToken(connectionId, client);
    return client;
  }

  #persistRefreshedToken(connectionId: string, client: RemoteClient) {
    client.on('token_refreshed', (accessToken: string, expiresAt: string | null) => {
      this.#connectionService
        .updateConnectionWithNewAccessToken(connectionId, accessToken, expiresAt)
        .catch((err: unknown) => {
          logger.error({ err, connectionId }, `Failed to persist refreshed token`);
        });
    });
  }
}
