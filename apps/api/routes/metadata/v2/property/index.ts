import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { BadRequestError } from '@supaglue/core/errors';
import type {
  ListPropertiesPathParams,
  ListPropertiesQueryParams,
  ListPropertiesRequest,
  ListPropertiesResponse,
} from '@supaglue/schemas/v2/metadata';
import { CRM_COMMON_OBJECT_TYPES } from '@supaglue/types/crm';
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
      if (req.customerConnection.category !== 'crm') {
        throw new BadRequestError('Only CRM connections are supported for this operation');
      }
      const [client] = await remoteService.getCrmRemoteClient(req.customerConnection.id);
      const { type, name } = req.query;
      if (type === 'common' && !(CRM_COMMON_OBJECT_TYPES as unknown as string[]).includes(name)) {
        throw new BadRequestError(
          `${name} is not a valid common object type for the ${req.customerConnection.category} category}`
        );
      }
      const properties =
        req.query.type === 'common'
          ? await client.listCommonProperties({
              type: 'common',
              name: req.query.name,
            })
          : await client.listProperties({
              type: req.query.type,
              name: req.query.name,
            });
      return res.status(200).send({ properties });
    }
  );

  app.use('/properties', propertiesRouter);
}
