import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { BadRequestError } from '@supaglue/core/errors';
import type {
  ListObjectsPathParams,
  ListObjectsQueryParams,
  ListObjectsRequest,
  ListObjectsResponse,
} from '@supaglue/schemas/v2/mgmt';
import { snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { remoteService } = getDependencyContainer();

export default function init(app: Router): void {
  const objectsRouter = Router({ mergeParams: true });
  objectsRouter.use(connectionHeaderMiddleware);

  objectsRouter.get(
    '/',
    async (
      req: Request<ListObjectsPathParams, ListObjectsResponse, ListObjectsRequest, ListObjectsQueryParams>,
      res: Response<ListObjectsResponse>
    ) => {
      if (req.customerConnection.category !== 'crm') {
        throw new BadRequestError('Only CRM connections are supported for this operation');
      }
      const [client] = await remoteService.getCrmRemoteClient(req.customerConnection.id);
      const objects = await client.listObjects();
      return res.status(200).send({ objects: objects.map(snakecaseKeys) });
    }
  );

  app.use('/objects', objectsRouter);
}
