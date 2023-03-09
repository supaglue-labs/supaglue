import { getDependencyContainer } from '@/dependency_container';
import { Request, Response, Router } from 'express';

const { connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  const connectionRouter = Router();

  connectionRouter.get('/', async (req: Request, res: Response) => {
    const connections = await connectionService.list();
    return res.status(200).send(connections);
  });

  // NOTE: There is no POST /connections since creating a connection is done upon a successful oauth flow

  connectionRouter.get('/:connectionId', async (req: Request, res: Response) => {
    const connection = await connectionService.getById(req.params.connectionId);
    return res.status(200).send(connection);
  });

  // NOTE: There is no PUT /connections/:connection_id since updating a connection is done upon a successful oauth flow

  connectionRouter.delete('/:connectionId', async (req: Request, res: Response) => {
    // TODO: revoke token from provider?

    const connection = await connectionService.delete(req.params.connectionId);
    return res.status(200).send(connection);
  });

  app.use('/connections', connectionRouter);
}
