import { getDependencyContainer } from '@/dependency_container';
import { ConnectionCreateParams, ConnectionUpsertParams } from '@supaglue/core/types/connection';
import { Request, Response, Router } from 'express';
import simpleOauth2, { AuthorizationMethod } from 'simple-oauth2';

const { integrationService, connectionWriterService } = getDependencyContainer();

const SimpleOAuth2AuthFields: Record<string, any> = {
  salesforce: {
    tokenHost: 'https://login.salesforce.com',
    tokenPath: '/services/oauth2/token',
    authorizeHost: 'https://login.salesforce.com',
    authorizePath: '/services/oauth2/authorize',
  },
  hubspot: {
    tokenHost: 'https://api.hubapi.com',
    tokenPath: '/oauth/v1/token',
    authorizeHost: 'https://app.hubspot.com',
    authorizePath: '/oauth/authorize',
  },
};
const REDIRECT_URI = 'http://localhost:8080/oauth/callback'; // TODO: data-drive
const RETURN_URL = 'http://localhost:3000'; // TODO: data-drive

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

      const { oauthScopes } = integration.config.oauth;
      const { oauthClientId, oauthClientSecret } = integration.config.oauth.credentials;

      const client = new simpleOauth2.AuthorizationCode({
        client: {
          id: oauthClientId,
          secret: oauthClientSecret,
        },
        auth: SimpleOAuth2AuthFields[providerName],
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
        providerName?: string;
        customerId?: string;
      } = JSON.parse(decodeURIComponent(state));

      if (!providerName || (providerName !== 'salesforce' && providerName !== 'hubspot')) {
        throw new Error('No providerName or supported providerName on state object');
      }

      if (!scope) {
        throw new Error('No scope on state object');
      }

      if (!customerId) {
        throw new Error('No customerId on state object');
      }

      const integration = await integrationService.getByProviderName(providerName);
      const { oauthClientId, oauthClientSecret } = integration.config.oauth.credentials;

      const client = new simpleOauth2.AuthorizationCode({
        client: {
          id: oauthClientId,
          secret: oauthClientSecret,
        },
        auth: SimpleOAuth2AuthFields[providerName],
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
          raw: accessToken.token,
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
