import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { snakecaseKeys } from '@/lib/snakecase';
import {
  CreateApplicationPathParams,
  CreateApplicationRequest,
  CreateApplicationResponse,
  DeleteApplicationPathParams,
  DeleteApplicationRequest,
  DeleteApplicationResponse,
  GetApplicationPathParams,
  GetApplicationRequest,
  GetApplicationResponse,
  GetApplicationsPathParams,
  GetApplicationsRequest,
  GetApplicationsResponse,
  UpdateApplicationPathParams,
  UpdateApplicationRequest,
  UpdateApplicationResponse,
} from '@supaglue/schemas/mgmt';
import { Request, Response, Router } from 'express';
import customer from './customer';
import integration from './integration';

const { applicationService } = getDependencyContainer();

export default function init(app: Router): void {
  const applicationRouter = Router();

  applicationRouter.get(
    '/',
    async (
      req: Request<GetApplicationsPathParams, GetApplicationsResponse, GetApplicationsRequest>,
      res: Response<GetApplicationsResponse>
    ) => {
      const applications = await applicationService.list();
      // TODO: Figure out why typing doesn't work here
      return res.status(200).send(applications.map(snakecaseKeys) as GetApplicationsResponse);
    }
  );

  applicationRouter.post(
    '/',
    async (
      req: Request<CreateApplicationPathParams, CreateApplicationResponse, CreateApplicationRequest>,
      res: Response<CreateApplicationResponse>
    ) => {
      const application = await applicationService.create(camelcaseKeys(req.body));
      // TODO: Figure out why typing doesn't work here
      return res.status(201).send(snakecaseKeys(application) as CreateApplicationResponse);
    }
  );

  applicationRouter.get(
    '/:application_id',
    async (
      req: Request<GetApplicationPathParams, GetApplicationResponse, GetApplicationRequest>,
      res: Response<GetApplicationResponse>
    ) => {
      const application = await applicationService.getById(req.params.application_id);
      // TODO: Figure out why typing doesn't work here
      return res.status(200).send(snakecaseKeys(application) as GetApplicationResponse);
    }
  );

  applicationRouter.put(
    '/:application_id',
    async (
      req: Request<UpdateApplicationPathParams, UpdateApplicationResponse, UpdateApplicationRequest>,
      res: Response<UpdateApplicationResponse>
    ) => {
      const application = await applicationService.update(req.params.application_id, camelcaseKeys(req.body));
      // TODO: Figure out why typing doesn't work here
      return res.status(200).send(snakecaseKeys(application) as UpdateApplicationResponse);
    }
  );

  applicationRouter.delete(
    '/:application_id',
    async (
      req: Request<DeleteApplicationPathParams, DeleteApplicationResponse, DeleteApplicationRequest>,
      res: Response<DeleteApplicationResponse>
    ) => {
      const application = await applicationService.delete(req.params.application_id);
      // TODO: Figure out why typing doesn't work here
      return res.status(200).send(snakecaseKeys(application) as DeleteApplicationResponse);
    }
  );
  customer(applicationRouter);
  integration(applicationRouter);

  app.use('/applications', applicationRouter);
}
