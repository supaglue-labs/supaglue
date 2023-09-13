import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import type {
  ListPropertiesPathParams,
  ListPropertiesQueryParams,
  ListPropertiesRequest,
  ListPropertiesResponse,
} from '@supaglue/schemas/v2/metadata';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { remoteService } = getDependencyContainer();

export default function init(app: Router): void {
  const propertiesRouter = Router({ mergeParams: true });
  propertiesRouter.use(connectionHeaderMiddleware);

  propertiesRouter.get(
    '/',
    async (
      req: Request<ListPropertiesPathParams, ListPropertiesResponse, ListPropertiesRequest, ListPropertiesQueryParams>,
      res: Response<ListPropertiesResponse>
    ) => {
      const client = await remoteService.getRemoteClient(req.customerConnection.id);
      const properties = await client.listProperties({
        type: req.query.type,
        name: req.query.name,
      });
      return res.status(200).send({ properties });
    }
  );

  app.use('/properties', propertiesRouter);
}
