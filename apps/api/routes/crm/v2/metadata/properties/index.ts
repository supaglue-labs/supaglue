import { getDependencyContainer } from '@/dependency_container';
import { connectionHeaderMiddleware } from '@/middleware/connection';
import { NotImplementedError } from '@supaglue/core/errors';
import type {
  CreatePropertiesPathParams,
  CreatePropertiesQueryParams,
  CreatePropertiesRequest,
  CreatePropertiesResponse,
  GetPropertiesPathParams,
  GetPropertiesQueryParams,
  GetPropertiesRequest,
  GetPropertiesResponse,
  ListPropertiesPathParams,
  ListPropertiesQueryParams,
  ListPropertiesRequest,
  ListPropertiesResponse,
  RegisterPropertiesPathParams,
  RegisterPropertiesQueryParams,
  RegisterPropertiesRequest,
  RegisterPropertiesResponse,
  UpdatePropertiesPathParams,
  UpdatePropertiesQueryParams,
  UpdatePropertiesRequest,
  UpdatePropertiesResponse,
} from '@supaglue/schemas/v2/crm';
import { camelcaseKeys, snakecaseKeys } from '@supaglue/utils';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { remoteService } = getDependencyContainer();

export default function init(app: Router): void {
  const propertiesRouter = Router({ mergeParams: true });
  propertiesRouter.use(connectionHeaderMiddleware);

  propertiesRouter.get(
    '/:object_name',
    async (
      req: Request<ListPropertiesPathParams, ListPropertiesResponse, ListPropertiesRequest, ListPropertiesQueryParams>,
      res: Response<ListPropertiesResponse>
    ) => {
      const client = await remoteService.getRemoteClient(req.customerConnection.id);
      const properties = await client.listPropertiesUnified(req.params.object_name);
      return res.status(200).send({ properties: properties.map(snakecaseKeys) });
    }
  );

  propertiesRouter.post(
    '/:object_name',
    async (
      req: Request<
        CreatePropertiesPathParams,
        CreatePropertiesResponse,
        CreatePropertiesRequest,
        CreatePropertiesQueryParams
      >,
      res: Response<CreatePropertiesResponse>
    ) => {
      const client = await remoteService.getRemoteClient(req.customerConnection.id);
      const property = await client.createProperty(req.params.object_name, camelcaseKeys(req.body));

      return res.status(201).send(snakecaseKeys(property));
    }
  );

  propertiesRouter.post(
    '/:object_name/register',
    async (
      req: Request<
        RegisterPropertiesPathParams,
        RegisterPropertiesResponse,
        RegisterPropertiesRequest,
        RegisterPropertiesQueryParams
      >,
      res: Response<RegisterPropertiesResponse>
    ) => {
      throw new NotImplementedError();
    }
  );

  propertiesRouter.get(
    '/:object_name/:property_name',
    async (
      req: Request<GetPropertiesPathParams, GetPropertiesResponse, GetPropertiesRequest, GetPropertiesQueryParams>,
      res: Response<GetPropertiesResponse>
    ) => {
      const client = await remoteService.getRemoteClient(req.customerConnection.id);
      const property = await client.getProperty(req.params.object_name, req.params.property_name);
      return res.status(200).send(snakecaseKeys(property));
    }
  );

  propertiesRouter.patch(
    '/:object_name/:property_name',
    async (
      req: Request<
        UpdatePropertiesPathParams,
        UpdatePropertiesResponse,
        UpdatePropertiesRequest,
        UpdatePropertiesQueryParams
      >,
      res: Response<UpdatePropertiesResponse>
    ) => {
      const client = await remoteService.getRemoteClient(req.customerConnection.id);
      const property = await client.updateProperty(
        req.params.object_name,
        req.params.property_name,
        camelcaseKeys(req.body)
      );

      return res.status(200).send(snakecaseKeys(property));
    }
  );

  app.use('/properties', propertiesRouter);
}
