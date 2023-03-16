import { getDependencyContainer } from '@/dependency_container';
import { getConnectorAuthConfig } from '@supaglue/core/remotes/crm';
import { ConnectionCreateParams, ConnectionUpsertParams } from '@supaglue/core/types/connection';
import { CRMProviderName, SUPPORTED_CRM_CONNECTIONS } from '@supaglue/core/types/crm';
import { Request, Response, Router } from 'express';
import simpleOauth2, { AuthorizationMethod } from 'simple-oauth2';

const { integrationService, connectionWriterService } = getDependencyContainer();

const SERVER_URL = process.env.SUPAGLUE_SERVER_URL ?? 'http://localhost:8080';
const REDIRECT_URI = `${SERVER_URL}/oauth/callback`;
const RETURN_URL = process.env.SUPAGLUE_OAUTH_RETURN_URL ?? 'http://localhost:3000';

export default function init(app: Router): void {
  const publicOauthRouter = Router();

  publicOauthRouter.get(
    '/connect',
    async (req: Request<never, any, never, any, { customerId: string; providerName: string }>, res: Response) => {
      const { customerId, providerName, returnUrl } = req.query;

      if (!customerId) {
        throw new Error('Missing customerId');
      }

      if (!providerName) {
        throw new Error('Missing providerName');
      }

      const integration = await integrationService.getByProviderName(providerName);

      if (!integration.config) {
        throw new Error('Integration is not configured');
      }

      const { oauthScopes } = integration.config.oauth;
      const { oauthClientId, oauthClientSecret } = integration.config.oauth.credentials;

      const client = new simpleOauth2.AuthorizationCode({
        client: {
          id: oauthClientId,
          secret: oauthClientSecret,
        },
        auth: getConnectorAuthConfig(providerName),
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
          returnUrl: returnUrl ?? RETURN_URL,
          customerId,
          providerName,
          scope: oauthScopes.join(' '), // TODO: this should be in a session
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
      }: {
        returnUrl: string;
        scope?: string;
        providerName?: CRMProviderName;
        customerId?: string;
      } = JSON.parse(decodeURIComponent(state));

      if (!providerName || !SUPPORTED_CRM_CONNECTIONS.includes(providerName)) {
        throw new Error('No providerName or supported providerName on state object');
      }

      if (!scope) {
        throw new Error('No scope on state object');
      }

      if (!customerId) {
        throw new Error('No customerId on state object');
      }

      const integration = await integrationService.getByProviderName(providerName);

      if (!integration.config) {
        throw new Error('Integration is not configured');
      }

      const { oauthClientId, oauthClientSecret } = integration.config.oauth.credentials;

      const client = new simpleOauth2.AuthorizationCode({
        client: {
          id: oauthClientId,
          secret: oauthClientSecret,
        },
        auth: getConnectorAuthConfig(providerName),
        options: {
          authorizationMethod: 'body' as AuthorizationMethod,
        },
      });

      // TODO: implement code_verifier/code_challenge when we implement sessions
      const additionalAuthParams: Record<string, string> = {};

      const accessToken = await client.getToken({
        code,
        redirect_uri: REDIRECT_URI,
        ...additionalAuthParams,
      });

      const payload: ConnectionCreateParams | ConnectionUpsertParams = {
        category: 'crm',
        providerName,
        customerId,
        integrationId: integration.id,
        credentials: {
          type: 'oauth2',
          accessToken: accessToken.token['access_token'] as string,
          refreshToken: accessToken.token['refresh_token'] as string,
          instanceUrl: accessToken.token['instance_url'] as string,
          expiresAt: accessToken.token['expires_at'] as string,
        },
      };

      try {
        await connectionWriterService.create(payload);
      } catch (e: any) {
        if (e.code === 'P2002') {
          await connectionWriterService.upsert(payload);
        }
      }

      res.redirect(returnUrl);
    }
  );

  app.use('/oauth', publicOauthRouter);
}
