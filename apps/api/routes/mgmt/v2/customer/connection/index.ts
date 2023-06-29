import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError } from '@supaglue/core/errors';
import { getCustomerIdPk } from '@supaglue/core/lib';
import { CrmRemoteClient } from '@supaglue/core/remotes/crm/base';
import {
  DeleteConnectionPathParams,
  DeleteConnectionRequest,
  DeleteConnectionResponse,
  GetConnectionPathParams,
  GetConnectionRequest,
  GetConnectionResponse,
  GetConnectionsPathParams,
  GetConnectionsRequest,
  GetConnectionsResponse,
  ListPropertiesPathParams,
  ListPropertiesRequest,
  ListPropertiesResponse,
  UpdateConnectionPathParams,
  UpdateConnectionRequest,
  UpdateConnectionResponse,
} from '@supaglue/schemas/v2/mgmt';
import { CRM_COMMON_MODEL_TYPES } from '@supaglue/types/crm';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import { Request, Response, Router } from 'express';

const { connectionService, connectionAndSyncService, remoteService } = getDependencyContainer();

export default function init(app: Router): void {
  const connectionRouter = Router({ mergeParams: true });

  connectionRouter.get(
    '/',
    async (
      req: Request<GetConnectionsPathParams, GetConnectionsResponse, GetConnectionsRequest>,
      res: Response<GetConnectionsResponse>
    ) => {
      const customerId = getCustomerIdPk(req.supaglueApplication.id, req.params.customer_id);
      const connections = await connectionService.listSafe(req.supaglueApplication.id, customerId);
      return res.status(200).send(connections.map(snakecaseKeys));
    }
  );

  connectionRouter.post(
    '/:connection_id/_list_properties',
    async (
      req: Request<ListPropertiesPathParams, ListPropertiesResponse, ListPropertiesRequest>,
      res: Response<ListPropertiesResponse>
    ) => {
      const connection = await connectionService.getSafeByIdAndApplicationId(
        req.params.connection_id,
        req.supaglueApplication.id
      );
      if (connection.category !== 'crm') {
        throw new BadRequestError('Only CRM connections are supported for this operation');
      }
      const client = (await remoteService.getRemoteClient(req.params.connection_id)) as CrmRemoteClient;
      const { name, type } = req.body;
      if (type === 'common' && !(CRM_COMMON_MODEL_TYPES as unknown as string[]).includes(name)) {
        throw new BadRequestError(`${name} is not a valid common object type for the ${connection.category} category}`);
      }
      const properties = await client.listProperties(req.body);
      return res.status(200).send({ properties });
    }
  );

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
