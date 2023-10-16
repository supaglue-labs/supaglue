import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import type {
  ListStandardObjectsPathParams,
  ListStandardObjectsRequest,
  ListStandardObjectsResponse,
} from '@supaglue/schemas/v2/metadata';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { metadataService } = getDependencyContainer();

export default function init(app: Router): void {
  const objectRouter = Router();

  objectRouter.use(connectionHeaderMiddleware);

  objectRouter.get(
    '/standard',
    async (
      req: Request<ListStandardObjectsPathParams, ListStandardObjectsResponse, ListStandardObjectsRequest>,
      res: Response<ListStandardObjectsResponse>
    ) => {
      const standardObjects = await metadataService.listStandardObjects(req.customerConnection.id);
      return res.status(200).send(standardObjects.map((name) => ({ name })));
    }
  );

  app.use('/objects', objectRouter);
}
