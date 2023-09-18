import type {
  ConnectionUnsafe,
  CRMProvider,
  EngagementProvider,
  EnrichmentProvider,
  MarketingAutomationProvider,
  OauthProvider,
} from '@supaglue/types';
import type { ProviderService } from '.';
import { InternalServerError } from '../errors';
import { logger } from '../lib';
import { getRemoteClient } from '../remotes';
import type { RemoteClient } from '../remotes/base';
import { getCrmRemoteClient } from '../remotes/categories/crm';
import type { CrmRemoteClient } from '../remotes/categories/crm/base';
import { getEngagementRemoteClient } from '../remotes/categories/engagement';
import type { EngagementRemoteClient } from '../remotes/categories/engagement/base';
import { getEnrichmentRemoteClient } from '../remotes/categories/enrichment';
import type { EnrichmentRemoteClient } from '../remotes/categories/enrichment/base';
import type { MarketingAutomationRemoteClient } from '../remotes/categories/marketing_automation/base';
import { getMarketingAutmationRemoteClient as getMarketingAutomationRemoteClient } from '../remotes/categories/marketing_automation/index';
import type { ConnectionService } from './connection_service';

export class RemoteService {
  #connectionService: ConnectionService;
  #providerService: ProviderService;

  public constructor(connectionService: ConnectionService, providerService: ProviderService) {
    this.#connectionService = connectionService;
    this.#providerService = providerService;
  }

  // TODO: Abstract some of the logic in these methods into a common method

  public async getCrmRemoteClient(connectionId: string): Promise<[CrmRemoteClient, CRMProvider['name']]> {
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
    return [client, provider.name];
  }

  public async getEngagementRemoteClient(
    connectionId: string
  ): Promise<[EngagementRemoteClient, EngagementProvider['name']]> {
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

    if (provider.authType === 'oauth2' && !(provider as OauthProvider).config.oauth) {
      throw new Error('Oauth provider must have config');
    }

    const client = getEngagementRemoteClient(connection as ConnectionUnsafe<typeof provider.name>, provider);
    this.#persistRefreshedToken(connectionId, client);
    return [client, provider.name];
  }

  public async getEnrichmentRemoteClient(
    connectionId: string
  ): Promise<[EnrichmentRemoteClient, EnrichmentProvider['name']]> {
    const connection = await this.#connectionService.getUnsafeById(connectionId);
    const provider = await this.#providerService.getById(connection.providerId);

    if (connection.category !== 'enrichment' || provider.category !== 'enrichment') {
      throw new Error(`Connection or provider category was unexpectedly not 'enrichment'`);
    }

    if (connection.providerName !== provider.name) {
      throw new InternalServerError(
        `Connection providerName ${connection.providerName} unexpectedly does not match provider providerName ${provider.name}.`
      );
    }

    const client = getEnrichmentRemoteClient(connection as ConnectionUnsafe<typeof provider.name>, provider);
    this.#persistRefreshedToken(connectionId, client);
    return [client, provider.name];
  }

  public async getMarketingAutomationRemoteClient(
    connectionId: string
  ): Promise<[MarketingAutomationRemoteClient, MarketingAutomationProvider['name']]> {
    const connection = await this.#connectionService.getUnsafeById(connectionId);
    const provider = await this.#providerService.getById(connection.providerId);

    // TODO: Restore this when we truly allow provider to be from multiple categories
    // if (connection.category !== 'marketing_automation' || provider.category !== 'marketing_automation') {
    //   throw new Error(`Connection or provider category was unexpectedly not 'marketing_automation'`);
    // }

    if (connection.providerName !== provider.name) {
      throw new InternalServerError(
        `Connection providerName ${connection.providerName} unexpectedly does not match provider providerName ${provider.name}.`
      );
    }

    // const client = getMarketingAutomationRemoteClient(connection as ConnectionUnsafe<typeof provider.name>, provider);
    // TODO: fix this when we truly allow provider to be from multiple categories
    const client = getMarketingAutomationRemoteClient(connection as any, provider as any);
    this.#persistRefreshedToken(connectionId, client);
    // TODO: fix this when we truly allow provider to be from multiple categories
    // return [client, provider.name];
    return [client, provider.name as MarketingAutomationProvider['name']];
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

    if (provider.authType === 'oauth2' && !(provider as OauthProvider).config.oauth) {
      throw new Error('Oauth provider must have config');
    }

    const client = getRemoteClient(connection as ConnectionUnsafe<typeof provider.name>, provider);
    this.#persistRefreshedToken(connectionId, client);
    return client;
  }

  #persistRefreshedToken(connectionId: string, client: RemoteClient) {
    client.on(
      'token_refreshed',
      ({
        accessToken,
        refreshToken,
        expiresAt,
      }: {
        accessToken: string;
        refreshToken?: string;
        expiresAt: string | null;
      }) => {
        this.#connectionService
          .updateConnectionWithNewTokens(connectionId, accessToken, refreshToken, expiresAt)
          .catch((err: unknown) => {
            logger.error({ err, connectionId }, `Failed to persist refreshed token`);
          });
      }
    );
  }
}
