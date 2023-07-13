import { getDependencyContainer } from '@/dependency_container';
import { Client as HubspotClient } from '@hubspot/api-client';
import { BadRequestError } from '@supaglue/core/errors';
import { getConnectorAuthConfig } from '@supaglue/core/remotes';
import type { ConnectionCreateParamsAny, ConnectionUpsertParamsAny, Provider, ProviderName } from '@supaglue/types';
import type { CRMProviderName } from '@supaglue/types/crm';
import { SUPPORTED_CRM_PROVIDERS } from '@supaglue/types/crm';
import type { EngagementProviderName } from '@supaglue/types/engagement';
import { SUPPORTED_ENGAGEMENT_PROVIDERS } from '@supaglue/types/engagement';
import type { Request, Response } from 'express';
import { Router } from 'express';
import type { AuthorizationMethod } from 'simple-oauth2';
import simpleOauth2 from 'simple-oauth2';

const { providerService, connectionAndSyncService, applicationService } = getDependencyContainer();

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
      const { applicationId, customerId, providerName, returnUrl, loginUrl, scope } = req.query;

      if (!applicationId) {
        throw new BadRequestError('Missing applicationId');
      }

      // set the req.orgId so that we can use it in the posthog middleware
      req.orgId = (await applicationService.getById(applicationId)).orgId;

      if (!customerId) {
        throw new BadRequestError('Missing customerId');
      }

      if (!providerName) {
        throw new BadRequestError('Missing providerName');
      }

      if (!returnUrl) {
        throw new BadRequestError('Missing returnUrl');
      }

      let provider: Provider | null = null;

      try {
        provider = await providerService.getByNameAndApplicationId(providerName, applicationId);
      } catch (err) {
        throw new BadRequestError(`Can't find provider with name: ${providerName}.`);
      }

      const {
        oauthScopes,
        credentials: { oauthClientId, oauthClientSecret },
      } = provider.config.oauth;

      if (provider.name === 'ms_dynamics_365_sales') {
        // For Dynamics 365, we need to get the scope from the query params
        // this is because the scope is in the form of: https://org8d6f84ed.crm.dynamics.com/.default
        // and is per customer
        if (!scope) {
          throw new BadRequestError('Missing scope');
        }

        oauthScopes.push(scope);
      }

      const { additionalScopes, ...auth } = getConnectorAuthConfig(provider.category, providerName);

      oauthScopes.push(...(additionalScopes ?? []));

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
        scope: oauthScopes,
        state: JSON.stringify({
          returnUrl,
          applicationId,
          customerId,
          providerName,
          scope: oauthScopes, // TODO: this should be in a session
          loginUrl,
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
      }: {
        returnUrl: string;
        scope?: string;
        applicationId?: string;
        providerName?: ProviderName;
        customerId?: string;
        loginUrl?: string;
      } = JSON.parse(decodeURIComponent(state));

      if (!applicationId) {
        throw new Error('No applicationId on state object');
      }
      // set the req.orgId so that we can use it in the posthog middleware
      req.orgId = (await applicationService.getById(applicationId)).orgId;

      if (
        !providerName ||
        (!SUPPORTED_CRM_PROVIDERS.includes(providerName as CRMProviderName) &&
          !SUPPORTED_ENGAGEMENT_PROVIDERS.includes(providerName as EngagementProviderName))
      ) {
        throw new Error('No providerName or supported providerName on state object');
      }

      if (!scope) {
        throw new Error('No scope on state object');
      }

      if (!customerId) {
        throw new Error('No customerId on state object');
      }

      const provider = await providerService.getByNameAndApplicationId(providerName, applicationId);

      const { oauthClientId, oauthClientSecret } = provider.config.oauth.credentials;

      const { additionalScopes: _, ...auth } = getConnectorAuthConfig(provider.category, providerName);

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

      // TODO: We should move all the logic that is conditional on providerName
      // to their respective files
      const tokenWrapper = await client.getToken(
        {
          code,
          redirect_uri: REDIRECT_URI,
          ...additionalAuthParams,
        },
        {
          headers:
            providerName === 'gong'
              ? {
                  Authorization: `Basic ${Buffer.from(`${oauthClientId}:${oauthClientSecret}`).toString('base64')}`,
                }
              : undefined,
        }
      );

      let instanceUrl = (tokenWrapper.token['instance_url'] as string) ?? '';

      if (providerName === 'hubspot') {
        const accessToken = tokenWrapper.token['access_token'] as string;
        const hubspotClient = new HubspotClient({ accessToken: tokenWrapper.token['access_token'] as string });
        const { hubId } = await hubspotClient.oauth.accessTokensApi.getAccessToken(accessToken);
        instanceUrl = `https://app.hubspot.com/contacts/${hubId.toString()}`;
      }

      if (providerName === 'pipedrive') {
        instanceUrl = tokenWrapper.token.api_domain as string;
      }

      if (providerName === 'ms_dynamics_365_sales') {
        // find the scope that ends with .default
        const defaultScope = (tokenWrapper.token.scope as string).split(' ').find((s) => s.endsWith('.default'));
        if (!defaultScope) {
          throw new BadRequestError('Missing required scope');
        }

        // the instance url is the scope without the .default
        instanceUrl = defaultScope.replace('.default', '');
      }

      if (providerName === 'gong') {
        instanceUrl = tokenWrapper.token['api_base_url_for_customer'] as string;
      }

      const basePayload = {
        category: provider.category,
        applicationId,
        customerId,
        // TODO: Delete
        providerId: provider.id,
        credentials: {
          type: 'oauth2' as const,
          accessToken: tokenWrapper.token['access_token'] as string,
          refreshToken: tokenWrapper.token['refresh_token'] as string,
          expiresAt: (tokenWrapper.token['expires_at'] as string | undefined) ?? null,
        },
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
        await connectionAndSyncService.create(payload as ConnectionCreateParamsAny);
      } catch (e: any) {
        if (e.code === 'P2003') {
          throw new BadRequestError(`Can't find customer with id: ${customerId}. Ensure it is URI encoded if needed.`);
        } else if (e.code === 'P2002') {
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
