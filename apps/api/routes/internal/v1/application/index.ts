import { getDependencyContainer } from '@/dependency_container';
import { Request, Response, Router } from 'express';

const { applicationService } = getDependencyContainer();

export default function init(app: Router): void {
  const applicationRouter = Router();

  applicationRouter.get('/', async (req: Request, res: Response) => {
    const applications = await applicationService.list(req.orgId);
    return res.status(200).send(applications);
  });

  applicationRouter.post('/', async (req: Request, res: Response) => {
    const application = await applicationService.create({ ...req.body, orgId: req.orgId });
    return res.status(201).send(application);
  });

  applicationRouter.get('/:application_id', async (req: Request, res: Response) => {
    const application = await applicationService.getByIdAndOrgId(req.params.application_id, req.orgId);
    return res.status(200).send(application);
  });

  app.use('/applications', applicationRouter);
}
