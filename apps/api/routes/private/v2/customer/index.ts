import { getDependencyContainer } from '@/dependency_container';
import { Router } from 'express';
import connection from './connection/index';

const { customerService } = getDependencyContainer();

export default function init(app: Router): void {
  const customerRouter = Router();

  app.use('/customers', customerRouter);

  const perCustomerRouter = Router({ mergeParams: true });

  connection(perCustomerRouter);
  customerRouter.use('/:customer_id', perCustomerRouter);
}
