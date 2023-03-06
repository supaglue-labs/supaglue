import { getDependencyContainer } from '@/dependency_container';
import { integrationMiddleware } from '@/middleware/integration';
import { Request, Response, Router } from 'express';
import connection from './connection';

const { integrationService } = getDependencyContainer();

export default function init(app: Router): void {
  app.get('/integrations', async (req: Request, res: Response) => {
    const integrations = await integrationService.list();
    return res.status(200).send(integrations);
  });

  app.post('/integrations', async (req: Request, res: Response) => {
    const integration = await integrationService.create(req.body);
    return res.status(201).send(integration);
  });

  const integrationRouter = Router();

  integrationRouter.get('/', async (req: Request, res: Response) => {
    const integration = await integrationService.getById(req.sg.integrationId);
    return res.status(200).send(integration);
  });

  integrationRouter.put('/', async (req: Request, res: Response) => {
    const integration = await integrationService.update(req.sg.integrationId, req.body);
    return res.status(200).send(integration);
  });

  integrationRouter.delete('/', async (req: Request, res: Response) => {
    const integration = await integrationService.delete(req.sg.integrationId);
    return res.status(200).send(integration);
  });

  connection(integrationRouter);

  app.use('/integrations/:integrationId', integrationMiddleware, integrationRouter);
}
