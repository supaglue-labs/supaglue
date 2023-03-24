import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { orgHeaderMiddleware } from '@/middleware/org';
import { snakecaseKeys } from '@supaglue/core/lib/snakecase';
import { Request, Response, Router } from 'express';

const { applicationService } = getDependencyContainer();

export default function init(app: Router): void {
  const applicationRouter = Router();
  applicationRouter.use(orgHeaderMiddleware);

  applicationRouter.get('/', async (req: Request, res: Response) => {
    const applications = await applicationService.list(req.orgId);
    return res.status(200).send(applications.map(snakecaseKeys));
  });

  applicationRouter.post('/', async (req: Request, res: Response) => {
    const application = await applicationService.create({ ...camelcaseKeys(req.body), orgId: req.orgId });
    return res.status(201).send(snakecaseKeys(application));
  });

  applicationRouter.get('/:application_id', async (req: Request, res: Response) => {
    const application = await applicationService.getByIdAndOrgId(req.params.application_id, req.orgId);
    return res.status(200).send(snakecaseKeys(application));
  });

  app.use('/applications', applicationRouter);
}
