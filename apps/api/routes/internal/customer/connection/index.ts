import { getDependencyContainer } from '@/dependency_container';
import { getCustomerIdPk } from '@supaglue/core/lib';
import type {
  DeleteConnectionPathParams,
  DeleteConnectionRequest,
  DeleteConnectionResponse,
  GetConnectionPathParams,
  GetConnectionRequest,
  GetConnectionResponse,
  UpdateConnectionPathParams,
  UpdateConnectionRequest,
  UpdateConnectionResponse,
} from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

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

  connectionRouter.patch(
    '/:connection_id',
    async (
      req: Request<UpdateConnectionPathParams, UpdateConnectionResponse, UpdateConnectionRequest>,
      res: Response<UpdateConnectionResponse>
    ) => {
      const connection = await connectionService.updateConnection(req.params.connection_id, camelcaseKeys(req.body));
      return res.status(200).send(snakecaseKeys(connection));
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
