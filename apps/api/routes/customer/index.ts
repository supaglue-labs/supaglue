import { getDependencyContainer } from '@/dependency_container';
import { customerMiddleware } from '@/middleware/customer';
import { openapiMiddleware } from '@/middleware/openapi';
import { Request, Response, Router } from 'express';
import integration from './integration';

const { customerService } = getDependencyContainer();

export default function init(app: Router): void {
  const customerRouter = Router();
  customerRouter.use(openapiMiddleware('customer'));

  app.get('/customers', async (req: Request, res: Response) => {
    const customers = await customerService.list();
    return res.status(200).send(customers);
  });

  app.post('/customers', async (req: Request, res: Response) => {
    const customer = await customerService.create(req.body);
    return res.status(201).send(customer);
  });

  customerRouter.get('/', async (req: Request, res: Response) => {
    const customer = await customerService.getById(req.sg.customerId);
    return res.status(200).send(customer);
  });

  customerRouter.put('/', async (req: Request, res: Response) => {
    const customer = await customerService.update(req.sg.customerId, req.body);
    return res.status(200).send(customer);
  });

  customerRouter.delete('/', async (req: Request, res: Response) => {
    const customer = await customerService.delete(req.sg.customerId);
    return res.status(200).send(customer);
  });

  integration(customerRouter);

  app.use('/customers/:customerId', customerMiddleware, customerRouter);
}
