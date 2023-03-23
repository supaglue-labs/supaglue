import { getDependencyContainer } from '@/dependency_container';
import { snakecaseKeys } from '@supaglue/core/lib/snakecase';
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
import { Request, Response, Router } from 'express';

const { connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const connectionRouter = Router();

  connectionRouter.get(
    '/',
    async (
      req: Request<GetConnectionsPathParams, GetConnectionsResponse, GetConnectionsRequest>,
      res: Response<GetConnectionsResponse>
    ) => {
      const connections = await connectionService.listSafe(req.supaglueApplication.id);
      return res.status(200).send(connections.map(snakecaseKeys));
    }
  );

  // NOTE: There is no POST /connections since creating a connection is done upon a successful oauth flow

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

      await connectionService.delete(req.params.connection_id, req.supaglueApplication.id);
      return res.status(204).send();
    }
  );

  app.use('/connections', connectionRouter);
}
