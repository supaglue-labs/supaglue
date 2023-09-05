import { getDependencyContainer } from '@/dependency_container';
import type { Request, Response } from 'express';
import { Router } from 'express';

const { applicationService, webhookService } = getDependencyContainer();

export default function init(app: Router): void {
  const applicationRouter = Router();

  applicationRouter.get('/', async (req: Request, res: Response) => {
    const applications = await applicationService.list(req.orgId);
    return res.status(200).send(applications);
  });

  applicationRouter.put('/', async (req: Request, res: Response) => {
    const application = await applicationService.upsert({ ...req.body, orgId: req.orgId });
    await webhookService.createApplication(application.id, application.name);
    return res.status(201).send(application);
  });

  applicationRouter.patch('/:application_id', async (req: Request, res: Response) => {
    const application = await applicationService.update(req.params.application_id, req.orgId, req.body);
    return res.status(200).send(application);
  });

  applicationRouter.get('/:application_id', async (req: Request, res: Response) => {
    const application = await applicationService.getByIdAndOrgId(req.params.application_id, req.orgId);
    return res.status(200).send(application);
  });

  applicationRouter.delete('/:application_id', async (req: Request, res: Response) => {
    await applicationService.delete(req.params.application_id, req.orgId);
    return res.status(204).end();
  });

  app.use('/applications', applicationRouter);
}
