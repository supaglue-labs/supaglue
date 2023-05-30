import { getDependencyContainer } from '@/dependency_container';
import { Client as HubspotClient } from '@hubspot/api-client';
import { BadRequestError } from '@supaglue/core/errors';
import { getConnectorAuthConfig } from '@supaglue/core/remotes';
import { ConnectionCreateParamsAny, ConnectionUpsertParamsAny, ProviderName } from '@supaglue/types';
import { CRMProviderName, SUPPORTED_CRM_CONNECTIONS } from '@supaglue/types/crm';
import { EngagementProviderName, SUPPORTED_ENGAGEMENT_CONNECTIONS } from '@supaglue/types/engagement';
import { Request, Response, Router } from 'express';
import simpleOauth2, { AuthorizationMethod } from 'simple-oauth2';

const { integrationService, connectionAndSyncService } = getDependencyContainer();

const SERVER_URL = process.env.SUPAGLUE_SERVER_URL ?? 'http://localhost:8080';
const REDIRECT_URI = `${SERVER_URL}/oauth/callback`;

export default function init(app: Router): void {
  const publicOauthRouter = Router();

  publicOauthRouter.get(
    '/connect',
    async (
      req: Request<never, any, never, any, { applicationId: string; customerId: string; providerName: string }>,
      res: Response
    ) => {
      const { applicationId, customerId, providerName, returnUrl, loginUrl, version = 'v1' } = req.query;

      if (!applicationId) {
        throw new BadRequestError('Missing applicationId');
      }

      if (!customerId) {
        throw new BadRequestError('Missing customerId');
      }

      if (!providerName) {
        throw new BadRequestError('Missing providerName');
      }

      if (!returnUrl) {
        throw new Error('Missing returnUrl');
      }

      if (version !== 'v1' && version !== 'v2') {
        throw new Error('Invalid version');
      }

      const integration = await integrationService.getByProviderNameAndApplicationId(providerName, applicationId);

      if (!integration.config) {
        throw new Error('Integration is not configured');
      }

      const { oauthScopes } = integration.config.oauth;
      const { oauthClientId, oauthClientSecret } = integration.config.oauth.credentials;

      const auth = getConnectorAuthConfig(integration.category, providerName);

      if (loginUrl) {
        auth.tokenHost = loginUrl;
        auth.authorizeHost = loginUrl;
      }

      const client = new simpleOauth2.AuthorizationCode({
        client: {
          id: oauthClientId,
          secret: oauthClientSecret,
        },
        auth,
        options: {
          authorizationMethod: 'body' as AuthorizationMethod,
        },
      });

      // TODO: implement code_verifier/code_challenge when we implement sessions
      const additionalAuthParams: Record<string, string> = {};

      const authorizationUri = client.authorizeURL({
        redirect_uri: REDIRECT_URI,
        scope: oauthScopes.join(' '),
        state: JSON.stringify({
          returnUrl,
          applicationId,
          customerId,
          providerName,
          scope: oauthScopes.join(' '), // TODO: this should be in a session
          loginUrl,
          version,
        }),
        ...additionalAuthParams,
      });

      res.redirect(authorizationUri);
    }
  );

  publicOauthRouter.get(
    '/callback',
    async (req: Request<never, any, never, { code: string; state: string }>, res: Response) => {
      const { code, state } = req.query;

      if (!code) {
        throw new Error('No oauth code param provided');
      }

      if (!state) {
        throw new Error('No oauth state param provided');
      }

      const {
        returnUrl,
        scope,
        providerName,
        customerId,
        applicationId,
        loginUrl,
        version,
      }: {
        returnUrl: string;
        scope?: string;
        applicationId?: string;
        providerName?: ProviderName;
        customerId?: string;
        loginUrl?: string;
        version?: string;
      } = JSON.parse(decodeURIComponent(state));

      if (
        !providerName ||
        (!SUPPORTED_CRM_CONNECTIONS.includes(providerName as CRMProviderName) &&
          !SUPPORTED_ENGAGEMENT_CONNECTIONS.includes(providerName as EngagementProviderName))
      ) {
        throw new Error('No providerName or supported providerName on state object');
      }

      if (!scope) {
        throw new Error('No scope on state object');
      }

      if (!applicationId) {
        throw new Error('No applicationId on state object');
      }

      if (!customerId) {
        throw new Error('No customerId on state object');
      }

      const integration = await integrationService.getByProviderNameAndApplicationId(providerName, applicationId);

      if (!integration.config) {
        throw new Error('Integration is not configured');
      }

      const { oauthClientId, oauthClientSecret } = integration.config.oauth.credentials;

      const auth = getConnectorAuthConfig(integration.category, providerName);

      if (loginUrl) {
        auth.tokenHost = loginUrl;
        auth.authorizeHost = loginUrl;
      }

      const client = new simpleOauth2.AuthorizationCode({
        client: {
          id: oauthClientId,
          secret: oauthClientSecret,
        },
        auth,
        options: {
          authorizationMethod: 'body' as AuthorizationMethod,
        },
      });

      // TODO: implement code_verifier/code_challenge when we implement sessions
      const additionalAuthParams: Record<string, string> = {};

      const tokenWrapper = await client.getToken({
        code,
        redirect_uri: REDIRECT_URI,
        ...additionalAuthParams,
      });

      let instanceUrl = (tokenWrapper.token['instance_url'] as string) ?? '';
      let remoteId = instanceUrl ?? '';

      if (providerName === 'hubspot') {
        const accessToken = tokenWrapper.token['access_token'] as string;
        const hubspotClient = new HubspotClient({ accessToken: tokenWrapper.token['access_token'] as string });
        const { hubId } = await hubspotClient.oauth.accessTokensApi.getAccessToken(accessToken);
        remoteId = hubId.toString();
        instanceUrl = `https://app.hubspot.com/contacts/${remoteId}`;
      }

      if (providerName === 'pipedrive') {
        instanceUrl = tokenWrapper.token.api_domain as string;
        remoteId = instanceUrl;
      }

      const basePayload = {
        category: integration.category,
        applicationId,
        customerId,
        integrationId: integration.id,
        credentials: {
          type: 'oauth2' as const,
          accessToken: tokenWrapper.token['access_token'] as string,
          refreshToken: tokenWrapper.token['refresh_token'] as string,
          expiresAt: (tokenWrapper.token['expires_at'] as string | undefined) ?? null,
        },
        remoteId,
        instanceUrl,
      };

      const payload =
        providerName === 'salesforce'
          ? {
              ...basePayload,
              providerName,
              credentials: {
                ...basePayload.credentials,
                instanceUrl,
                loginUrl,
              },
            }
          : { ...basePayload, providerName };

      try {
        await connectionAndSyncService.create(version === 'v2' ? 'v2' : 'v1', payload as ConnectionCreateParamsAny);
      } catch (e: any) {
        if (e.code === 'P2002') {
          await connectionAndSyncService.upsert(payload as ConnectionUpsertParamsAny);
        } else {
          throw e;
        }
      }

      res.redirect(returnUrl);
    }
  );

  app.use('/oauth', publicOauthRouter);
}
