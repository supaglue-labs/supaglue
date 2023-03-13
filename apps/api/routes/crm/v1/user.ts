import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { snakecaseKeys } from '@/lib/snakecase';
import { Request, Response, Router } from 'express';

const { userService } = getDependencyContainer();

export default function init(app: Router): void {
  const router = Router();

  router.get('/', async (req: Request, res: Response) => {
    const { next, previous, results } = await userService.list(req.customerConnection.id, req.query);
    const snakeCaseKeysResults = results.map((result) => {
      return snakecaseKeys(result);
    });
    return res.status(200).send({ next, previous, results: snakeCaseKeysResults });
  });

  router.get('/:user_id', async (req: Request, res: Response) => {
    const user = await userService.getById(req.params.user_id, req.customerConnection.id);
    return res.status(200).send(snakecaseKeys(user));
  });

  router.post('/', async (req: Request, res: Response) => {
    const { customerId, id: connectionId } = req.customerConnection;
    const user = await userService.create(customerId, connectionId, camelcaseKeys(req.body.model));
    return res.status(200).send({ model: snakecaseKeys(user) });
  });

  router.patch('/:user_id', async (req: Request, res: Response) => {
    const { customerId, id: connectionId } = req.customerConnection;
    const user = await userService.update(customerId, connectionId, {
      id: req.params.user_id,
      ...camelcaseKeys(req.body.model),
    });
    return res.status(200).send({ model: snakecaseKeys(user) });
  });

  router.delete('/:user_id', () => {
    throw new Error('Not implemented');
  });

  app.use('/users', router);
}
