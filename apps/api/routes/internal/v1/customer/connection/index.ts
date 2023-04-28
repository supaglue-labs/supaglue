import { getDependencyContainer } from '@/dependency_container';
import { Client as HubspotClient } from '@hubspot/api-client';
import { getCustomerIdPk } from '@supaglue/core/lib';
import {
  DeleteConnectionPathParams,
  DeleteConnectionRequest,
  DeleteConnectionResponse,
  GetConnectionPathParams,
  GetConnectionRequest,
  GetConnectionResponse,
  GetConnectionsPathParams,
  GetConnectionsRequest,
  GetConnectionsResponse,
} from '@supaglue/schemas/mgmt';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';
import * as jsforce from 'jsforce';

const { connectionService, integrationService, connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router): void {
  const connectionRouter = Router({ mergeParams: true });

  connectionRouter.get(
    '/',
    async (
      req: Request<GetConnectionsPathParams, GetConnectionsResponse, GetConnectionsRequest>,
      res: Response<GetConnectionsResponse>
    ) => {
      const customerId = getCustomerIdPk(req.supaglueApplication.id, req.params.customer_id);
      const connections = await connectionService.listSafe(req.supaglueApplication.id, customerId);
      return res.status(200).send(connections.map(snakecaseKeys));
    }
  );

  // TODO: clean this up
  connectionRouter.post('/', async (req: Request, res: Response) => {
    // Get integration first to get category and provider_name
    const integration = await integrationService.getByIdAndApplicationId(
      req.body.integration_id,
      req.supaglueApplication.id
    );

    if (integration.providerName === 'hubspot') {
      const hubspotClient = new HubspotClient();
      const token = await hubspotClient.oauth.tokensApi.createToken(
        'refresh_token',
        undefined,
        undefined,
        integration.config.oauth.credentials.oauthClientId,
        integration.config.oauth.credentials.oauthClientSecret,
        req.body.credentials.refresh_token
      );
      const expiresAt = new Date(Date.now() + token.expiresIn * 1000).toISOString();

      const { hubId } = await hubspotClient.oauth.accessTokensApi.getAccessToken(token.accessToken);
      const remoteId = hubId.toString();

      const connection = await connectionAndSyncService.create({
        // TODO: don't denormalize this?
        category: integration.category,
        providerName: integration.providerName,
        applicationId: req.supaglueApplication.id,
        customerId: req.params.customer_id,
        integrationId: req.body.integration_id,
        credentials: {
          type: req.body.credentials.type,
          accessToken: token.accessToken,
          refreshToken: req.body.credentials.refresh_token,
          expiresAt,
        },
        remoteId,
      });
      return res.status(200).send(snakecaseKeys(connection));
    }

    // salesforce
    if (integration.providerName === 'salesforce') {
      const salesforceClient = new jsforce.Connection({
        oauth2: new jsforce.OAuth2({
          loginUrl: req.body.credentials.loginUrl ?? 'https://login.salesforce.com',
          clientId: integration.config.oauth.credentials.oauthClientId,
          clientSecret: integration.config.oauth.credentials.oauthClientSecret,
        }),
        instanceUrl: req.body.credentials.instance_url,
        refreshToken: req.body.credentials.refresh_token,
        maxRequest: 10,
      });
      const { access_token } = await salesforceClient.oauth2.refreshToken(req.body.credentials.refreshToken);

      const connection = await connectionAndSyncService.create({
        // TODO: don't denormalize this?
        category: integration.category,
        providerName: integration.providerName,
        applicationId: req.supaglueApplication.id,
        customerId: req.params.customer_id,
        integrationId: req.body.integration_id,
        credentials: {
          type: req.body.credentials.type,
          accessToken: access_token,
          refreshToken: req.body.credentials.refresh_token,
          instanceUrl: req.body.credentials.instance_url,
          // salesforce does not specify expiresAt
          expiresAt: null,
        },
        remoteId: req.body.credentials.instance_url,
      });
      return res.status(200).send(snakecaseKeys(connection));
    }

    return res.status(200).send(null);
  });

  connectionRouter.get(
    '/:connection_id',
    async (
      req: Request<GetConnectionPathParams, GetConnectionResponse, GetConnectionRequest>,
      res: Response<GetConnectionResponse>
    ) => {
      const connection = await connectionService.getSafeByIdAndApplicationId(
        req.params.connection_id,
        req.supaglueApplication.id
      );
      return res.status(200).send(snakecaseKeys(connection));
    }
  );

  // NOTE: There is no PUT /connections/:connection_id since updating a connection is done upon a successful oauth flow

  connectionRouter.delete(
    '/:connection_id',
    async (
      req: Request<DeleteConnectionPathParams, DeleteConnectionResponse, DeleteConnectionRequest>,
      res: Response<DeleteConnectionResponse>
    ) => {
      // TODO: revoke token from provider?
      await connectionAndSyncService.delete(req.params.connection_id, req.supaglueApplication.id);
      return res.status(204).send();
    }
  );

  app.use('/connections', connectionRouter);
}
