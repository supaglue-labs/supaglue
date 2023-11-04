import { getDependencyContainer } from '@/dependency_container';
import { BadRequestError, NotImplementedError } from '@supaglue/core/errors';
import { getCustomerIdPk } from '@supaglue/core/lib';
import type {
  CreateConnectionPathParams,
  CreateConnectionRequest,
  CreateConnectionResponse,
  DeleteConnectionPathParams,
  DeleteConnectionRequest,
  DeleteConnectionResponse,
  GetConnectionPathParams,
  GetConnectionRequest,
  GetConnectionResponse,
  GetConnectionsPathParams,
  GetConnectionsRequest,
  GetConnectionsResponse,
  GetProviderUserIdPathParams,
  GetProvideruserIdQueryParams,
  GetProviderUserIdRequest,
  GetProviderUserIdResponse,
} from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys } from '@supaglue/utils';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { connectionService, connectionAndSyncService, remoteService, customerService } = getDependencyContainer();

export default function init(app: Router): void {
  const connectionRouter = Router({ mergeParams: true });

  connectionRouter.get(
    '/',
    async (
      req: Request<GetConnectionsPathParams, GetConnectionsResponse, GetConnectionsRequest>,
      res: Response<GetConnectionsResponse>
    ) => {
      const externalCustomerId = req.params.customer_id;
      const customerId = getCustomerIdPk(req.supaglueApplication.id, externalCustomerId);
      await customerService.getByExternalId(req.supaglueApplication.id, externalCustomerId); // Fetch to ensure it exists since `listSafeByCustomer` returns [] if not found
      const connections = await connectionService.listSafeByCustomer(req.supaglueApplication.id, customerId);
      return res.status(200).send(connections.map(snakecaseKeys));
    }
  );

  connectionRouter.get(
    '/_provider_user_id',
    async (
      req: Request<
        GetProviderUserIdPathParams,
        GetProviderUserIdResponse,
        GetProviderUserIdRequest,
        GetProvideruserIdQueryParams
      >,
      res: Response<GetProviderUserIdResponse>
    ) => {
      const providerName = req.query.provider_name;
      const connection = await connectionService.getSafeByExternalCustomerIdProviderNameAndApplicationId(
        req.params.customer_id,
        providerName,
        req.supaglueApplication.id
      );
      const client = await remoteService.getRemoteClient(connection.id);
      try {
        // Using "x-sg-minor-version: 1" to migrate customer, then will make it the default (no header) by removing __v2_1() as an interface
        if (req.headers['x-sg-minor-version'] === '1') {
          const { userId, rawDetails, additionalRawDetails } = await client.getUserIdAndDetails__v2_1();
          return res
            .status(200)
            .send({ user_id: userId, raw_details: rawDetails, additional_raw_details: additionalRawDetails });
        } else {
          const { userId, rawDetails, additionalRawDetails } = await client.getUserIdAndDetails();
          return res
            .status(200)
            .send({ user_id: userId, raw_details: rawDetails, additional_raw_details: additionalRawDetails });
        }
      } catch (err) {
        if (err instanceof NotImplementedError) {
          throw new BadRequestError(err.message);
        }
        throw err;
      }
    }
  );

  connectionRouter.post(
    '/',
    async (
      req: Request<CreateConnectionPathParams, CreateConnectionResponse, CreateConnectionRequest>,
      res: Response<CreateConnectionResponse>
    ) => {
      const connection = await connectionAndSyncService.createManually(
        req.supaglueApplication.id,
        req.params.customer_id,
        camelcaseKeys(req.body)
      );
      return res.status(200).send(snakecaseKeys(connection));
    }
  );

  connectionRouter.get(
    '/:connection_id',
    async (
      req: Request<GetConnectionPathParams, GetConnectionResponse, GetConnectionRequest>,
      res: Response<GetConnectionResponse>
    ) => {
      const externalCustomerId = req.params.customer_id;
      const customerId = getCustomerIdPk(req.supaglueApplication.id, externalCustomerId);
      const connection = await connectionService.getSafeByIdAndApplicationIdAndCustomerId(
        req.params.connection_id,
        req.supaglueApplication.id,
        customerId
      );

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
      const externalCustomerId = req.params.customer_id;
      await connectionAndSyncService.delete(req.params.connection_id, req.supaglueApplication.id, externalCustomerId);
      return res.status(204).end();
    }
  );

  app.use('/connections', connectionRouter);
}
