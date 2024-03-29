import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { BadRequestError } from '@supaglue/core/errors';
import type {
  DeleteConnectionSyncConfigPathParams,
  DeleteConnectionSyncConfigRequest,
  DeleteConnectionSyncConfigResponse,
  GetConnectionSyncConfigPathParams,
  GetConnectionSyncConfigRequest,
  GetConnectionSyncConfigResponse,
  UpsertConnectionSyncConfigPathParams,
  UpsertConnectionSyncConfigRequest,
  UpsertConnectionSyncConfigResponse,
} from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys, snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const connectionSyncConfigRouter = Router({ mergeParams: true });
  connectionSyncConfigRouter.use(connectionHeaderMiddleware);

  connectionSyncConfigRouter.get(
    '/',
    async (
      req: Request<GetConnectionSyncConfigPathParams, GetConnectionSyncConfigResponse, GetConnectionSyncConfigRequest>,
      res: Response<GetConnectionSyncConfigResponse>
    ) => {
      const { connectionSyncConfig } = req.customerConnection;

      if (!connectionSyncConfig) {
        throw new BadRequestError('Connection sync config not found');
      }

      return res.status(200).send(snakecaseKeys(connectionSyncConfig));
    }
  );

  connectionSyncConfigRouter.put(
    '/',
    async (
      req: Request<
        UpsertConnectionSyncConfigPathParams,
        UpsertConnectionSyncConfigResponse,
        UpsertConnectionSyncConfigRequest
      >,
      res: Response<UpsertConnectionSyncConfigResponse>
    ) => {
      const result = await connectionService.upsertConnectionSyncConfig(
        req.customerConnection.id,
        camelcaseKeys(req.body)
      );
      return res.status(200).send(snakecaseKeys(result));
    }
  );

  connectionSyncConfigRouter.delete(
    '/',
    async (
      req: Request<
        DeleteConnectionSyncConfigPathParams,
        DeleteConnectionSyncConfigResponse,
        DeleteConnectionSyncConfigRequest
      >,
      res: Response<DeleteConnectionSyncConfigResponse>
    ) => {
      await connectionService.deleteConnectionSyncConfig(req.customerConnection.id);
      return res.status(204).send();
    }
  );

  app.use('/connection_sync_configs', connectionSyncConfigRouter);
}
