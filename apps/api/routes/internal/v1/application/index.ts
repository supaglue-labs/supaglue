import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { snakecaseKeys } from '@supaglue/core/lib/snakecase';
import { Request, Response, Router } from 'express';

const { applicationService } = getDependencyContainer();

// TODO: need to protect these routes with some kind of org api key

export default function init(app: Router): void {
  const applicationRouter = Router();

  applicationRouter.get('/', async (req: Request, res: Response) => {
    const applications = await applicationService.list();
    return res.status(200).send(applications.map(snakecaseKeys));
  });

  applicationRouter.post('/', async (req: Request, res: Response) => {
    const application = await applicationService.create(camelcaseKeys(req.body));
    return res.status(201).send(snakecaseKeys(application));
  });

  applicationRouter.get('/:application_id', async (req: Request, res: Response) => {
    const application = await applicationService.getById(req.params.application_id);
    return res.status(200).send(snakecaseKeys(application));
  });

  app.use('/applications', applicationRouter);
}
