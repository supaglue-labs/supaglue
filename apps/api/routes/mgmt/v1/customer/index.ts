import { getDependencyContainer } from '@/dependency_container';
import { camelcaseKeys } from '@/lib/camelcase';
import { snakecaseKeys } from '@/lib/snakecase';
import { openapiMiddleware } from '@/middleware/openapi';
import {
  CreateCustomerPathParams,
  CreateCustomerRequest,
  CreateCustomerResponse,
  DeleteCustomerPathParams,
  DeleteCustomerRequest,
  DeleteCustomerResponse,
  GetCustomerPathParams,
  GetCustomerRequest,
  GetCustomerResponse,
  GetCustomersPathParams,
  GetCustomersRequest,
  GetCustomersResponse,
} from '@supaglue/schemas/mgmt';
import { Request, Response, Router } from 'express';
import connection from './connection';

const { customerService } = getDependencyContainer();

export default function init(app: Router): void {
  const customerRouter = Router();
  customerRouter.use(openapiMiddleware('customer'));

  customerRouter.get(
    '/',
    async (
      req: Request<GetCustomersPathParams, GetCustomersResponse, GetCustomersRequest>,
      res: Response<GetCustomersResponse>
    ) => {
      const customers = await customerService.list();
      return res.status(200).send(customers.map(snakecaseKeys));
    }
  );

  customerRouter.post(
    '/',
    async (
      req: Request<CreateCustomerPathParams, CreateCustomerResponse, CreateCustomerRequest>,
      res: Response<CreateCustomerResponse>
    ) => {
      const customer = await customerService.create(camelcaseKeys(req.body));
      return res.status(201).send(snakecaseKeys(customer));
    }
  );

  customerRouter.get(
    '/:customer_id',
    async (
      req: Request<GetCustomerPathParams, GetCustomerResponse, GetCustomerRequest>,
      res: Response<GetCustomerResponse>
    ) => {
      const customer = await customerService.getById(req.params.customer_id);
      return res.status(200).send(snakecaseKeys(customer));
    }
  );

  customerRouter.delete(
    '/:customer_id',
    async (
      req: Request<DeleteCustomerPathParams, DeleteCustomerResponse, DeleteCustomerRequest>,
      res: Response<DeleteCustomerResponse>
    ) => {
      const customer = await customerService.delete(req.params.customer_id);
      return res.status(200).send(snakecaseKeys(customer));
    }
  );

  connection(customerRouter);

  app.use('/customers', customerRouter);
}
