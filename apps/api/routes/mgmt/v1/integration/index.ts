import { getDependencyContainer } from '@/dependency_container';
import { Request, Response, Router } from 'express';

const { integrationService } = getDependencyContainer();

export default function init(app: Router): void {
  const integrationRouter = Router();

  integrationRouter.get('/', async (req: Request, res: Response) => {
    const integrations = await integrationService.list();
    return res.status(200).send(integrations);
  });

  integrationRouter.post('/', async (req: Request, res: Response) => {
    const integration = await integrationService.create(req.body);
    return res.status(201).send(integration);
  });

  integrationRouter.get('/:integrationId', async (req: Request, res: Response) => {
    const integration = await integrationService.getById(req.params.integrationId);
    return res.status(200).send(integration);
  });

  integrationRouter.put('/:integrationId', async (req: Request, res: Response) => {
    const integration = await integrationService.update(req.params.integrationId, req.body);
    return res.status(200).send(integration);
  });

  integrationRouter.delete('/:integrationId', async (req: Request, res: Response) => {
    const integration = await integrationService.delete(req.params.integrationId);
    return res.status(200).send(integration);
  });

  app.use('/integrations', integrationRouter);
}
