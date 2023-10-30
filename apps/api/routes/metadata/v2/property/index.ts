import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import type {
  ListPropertiesDeprecatedPathParams,
  ListPropertiesDeprecatedQueryParams,
  ListPropertiesDeprecatedRequest,
  ListPropertiesDeprecatedResponse,
} from '@supaglue/schemas/v2/metadata';
import { snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { remoteService } = getDependencyContainer();

export default function init(app: Router): void {
  const propertiesRouter = Router({ mergeParams: true });
  propertiesRouter.use(connectionHeaderMiddleware);

  propertiesRouter.get(
    '/',
    async (
      req: Request<
        ListPropertiesDeprecatedPathParams,
        ListPropertiesDeprecatedResponse,
        ListPropertiesDeprecatedRequest,
        ListPropertiesDeprecatedQueryParams
      >,
      res: Response<ListPropertiesDeprecatedResponse>
    ) => {
      const client = await remoteService.getRemoteClient(req.customerConnection.id);
      const properties = await client.listProperties({
        type: req.query.type,
        name: req.query.name,
      });
      return res.status(200).send({ properties: properties.map(snakecaseKeys) });
    }
  );

  app.use('/properties', propertiesRouter);
}
