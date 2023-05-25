import { getDependencyContainer } from '@/dependency_container';
import {
  CreateForceSyncPathParams,
  CreateForceSyncQueryParams,
  CreateForceSyncRequest,
  CreateForceSyncResponse,
} from '@supaglue/schemas/v1/mgmt';
import { Request, Response, Router } from 'express';

const { connectionAndSyncService } = getDependencyContainer();

export default function init(app: Router) {
  app.post(
    '/force-sync',
    async (
      req: Request<
        CreateForceSyncPathParams,
        CreateForceSyncResponse,
        CreateForceSyncRequest,
        CreateForceSyncQueryParams
      >,
      res: Response<CreateForceSyncResponse>
    ) => {
      await connectionAndSyncService.setForceSyncFlag(
        {
          applicationId: req.supaglueApplication.id,
          externalCustomerId: req.query.customer_id,
          providerName: req.query.provider_name,
        },
        true
      );

      return res.status(200).send({ success: true });
    }
  );
}
