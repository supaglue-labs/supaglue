import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError, NotImplementedError } from '@supaglue/core/errors';
import { getCustomerIdPk } from '@supaglue/core/lib';
import type {
  CreateConnectionPathParams,
  CreateConnectionRequest,
  CreateConnectionResponse,
  DeleteConnectionPathParams,
  DeleteConnectionRequest,
  DeleteConnectionResponse,
  GetConnectionPathParams,
  GetConnectionRequest,
  GetConnectionResponse,
  GetConnectionsPathParams,
  GetConnectionsRequest,
  GetConnectionsResponse,
  GetProviderUserIdPathParams,
  GetProvideruserIdQueryParams,
  GetProviderUserIdRequest,
  GetProviderUserIdResponse,
} from '@supaglue/schemas/v2/mgmt';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { connectionService, connectionAndSyncService, remoteService } = getDependencyContainer();

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

  connectionRouter.get(
    '/_provider_user_id',
    async (
      req: Request<
        GetProviderUserIdPathParams,
        GetProviderUserIdResponse,
        GetProviderUserIdRequest,
        GetProvideruserIdQueryParams
      >,
      res: Response<GetProviderUserIdResponse>
    ) => {
      const providerName = req.query.provider_name;
      const connection = await connectionService.getSafeByProviderNameAndApplicationId(
        providerName,
        req.supaglueApplication.id
      );

      const client = await remoteService.getCrmRemoteClient(connection.id);
      try {
        const userId = await client.getUserId();
        return res.status(200).send({ user_id: userId });
      } catch (err) {
        if (err instanceof NotImplementedError) {
          throw new BadRequestError(err.message);
        }
        throw err;
      }
    }
  );

  connectionRouter.post(
    '/',
    async (
      req: Request<CreateConnectionPathParams, CreateConnectionResponse, CreateConnectionRequest>,
      res: Response<CreateConnectionResponse>
    ) => {
      const connection = await connectionAndSyncService.createFromApiKey(
        req.supaglueApplication.id,
        req.params.customer_id,
        req.body.category,
        req.body.provider_name,
        req.body.api_key
      );
      return res.status(200).send(snakecaseKeys(connection));
    }
  );

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

      // enrich with user_id, if we can.
      // TODO remove this after users migrate to /_provider_user_id above
      const client = await remoteService.getCrmRemoteClient(req.params.connection_id);
      const userId = await client.getUserId();

      return res.status(200).send(snakecaseKeys({ ...connection, userId }));
    }
  );

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
