import { getDependencyContainer } from '@/dependency_container';
import { connectionMiddleware } from '@/middleware/connection';
import { Request, Response, Router } from 'express';
import syncHistory from './sync_history';
import syncInfo from './sync_info';

const { connectionService } = getDependencyContainer();

export default function init(app: Router): void {
  app.get('/connections', async (req: Request, res: Response) => {
    const connections = await connectionService.list();
    return res.status(200).send(connections);
  });

  // NOTE: There is no POST /connections since creating a connection is done upon a successful oauth flow

  const connectionRouter = Router();

  connectionRouter.get('/', async (req: Request, res: Response) => {
    const connection = await connectionService.getById(req.sg.connectionId);
    return res.status(200).send(connection);
  });

  // NOTE: There is no PUT /connections/:connection_id since updating a connection is done upon a successful oauth flow

  connectionRouter.delete('/', async (req: Request, res: Response) => {
    // TODO: revoke token from provider?

    const connection = await connectionService.delete(req.sg.connectionId);
    return res.status(200).send(connection);
  });

  syncInfo(connectionRouter);
  syncHistory(connectionRouter);

  app.use('/connections/:connectionId', connectionMiddleware, connectionRouter);
}
