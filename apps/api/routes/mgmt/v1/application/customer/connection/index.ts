import { getDependencyContainer } from '@/dependency_container';
import { snakecaseKeys } from '@/lib/snakecase';
import {
  DeleteConnectionPathParams,
  DeleteConnectionResponse,
  GetConnectionPathParams,
  GetConnectionResponse,
  GetConnectionsPathParams,
  GetConnectionsResponse,
} from '@supaglue/schemas/mgmt';
import { Request, Response, Router } from 'express';

const { connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const connectionRouter = Router();

  connectionRouter.get(
    '/',
    async (
      req: Request<GetConnectionsPathParams, GetConnectionsResponse, GetConnectionsResponse>,
      res: Response<GetConnectionsResponse>
    ) => {
      const connections = await connectionService.list();
      return res.status(200).send(connections.map(snakecaseKeys));
    }
  );

  // NOTE: There is no POST /connections since creating a connection is done upon a successful oauth flow

  connectionRouter.get(
    '/:connection_id',
    async (
      req: Request<GetConnectionPathParams, GetConnectionResponse, GetConnectionResponse>,
      res: Response<GetConnectionResponse>
    ) => {
      const connection = await connectionService.getById(req.params.connection_id);
      return res.status(200).send(snakecaseKeys(connection));
    }
  );

  // NOTE: There is no PUT /connections/:connection_id since updating a connection is done upon a successful oauth flow

  connectionRouter.delete(
    '/:connection_id',
    async (
      req: Request<DeleteConnectionPathParams, DeleteConnectionResponse, DeleteConnectionResponse>,
      res: Response<DeleteConnectionResponse>
    ) => {
      // TODO: revoke token from provider?

      const connection = await connectionService.delete(req.params.connection_id);
      return res.status(200).send(snakecaseKeys(connection));
    }
  );

  app.use('/connections', connectionRouter);
}
