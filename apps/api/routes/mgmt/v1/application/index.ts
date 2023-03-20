import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { snakecaseKeys } from '@supaglue/core/lib/snakecase';
import {
  CreateApplicationPathParams,
  CreateApplicationRequest,
  CreateApplicationResponse,
  GetApplicationPathParams,
  GetApplicationRequest,
  GetApplicationResponse,
  GetApplicationsPathParams,
  GetApplicationsRequest,
  GetApplicationsResponse,
} from '@supaglue/schemas/mgmt';
import { Request, Response, Router } from 'express';

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
      return res.status(200).send(applications.map(snakecaseKeys));
    }
  );

  applicationRouter.post(
    '/',
    async (
      req: Request<CreateApplicationPathParams, CreateApplicationResponse, CreateApplicationRequest>,
      res: Response<CreateApplicationResponse>
    ) => {
      const application = await applicationService.create(camelcaseKeys(req.body));
      return res.status(201).send(snakecaseKeys(application));
    }
  );

  applicationRouter.get(
    '/:application_id',
    async (
      req: Request<GetApplicationPathParams, GetApplicationResponse, GetApplicationRequest>,
      res: Response<GetApplicationResponse>
    ) => {
      const application = await applicationService.getById(req.params.application_id);
      return res.status(200).send(snakecaseKeys(application));
    }
  );

  app.use('/applications', applicationRouter);
}
