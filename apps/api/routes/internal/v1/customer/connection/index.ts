import { getDependencyContainer } from '@/dependency_container';
import { getCustomerIdPk } from '@supaglue/core/lib';
import {
  DeleteConnectionPathParams,
  DeleteConnectionRequest,
  DeleteConnectionResponse,
  GetConnectionPathParams,
  GetConnectionRequest,
  GetConnectionResponse,
} from '@supaglue/schemas/v1/mgmt';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { connectionService, connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router): void {
  const connectionRouter = Router({ mergeParams: true });

  connectionRouter.get('/', async (req: Request, res: Response) => {
    const customerId = getCustomerIdPk(req.supaglueApplication.id, req.params.customer_id);
    const unsafe = req.query.unsafe === 'true';
    const connections = unsafe
      ? await connectionService.listUnsafe(req.supaglueApplication.id, customerId)
      : await connectionService.listSafe(req.supaglueApplication.id, customerId);
    return res.status(200).send(connections.map(snakecaseKeys));
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
