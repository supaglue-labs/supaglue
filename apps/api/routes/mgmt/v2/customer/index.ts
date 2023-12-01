import { getDependencyContainer } from '@/dependency_container';
import type {
  DeleteCustomerPathParams,
  DeleteCustomerRequest,
  DeleteCustomerResponse,
  GetCustomerPathParams,
  GetCustomerRequest,
  GetCustomerResponse,
  GetCustomersPathParams,
  GetCustomersRequest,
  GetCustomersResponse,
  UpsertCustomerPathParams,
  UpsertCustomerRequest,
  UpsertCustomerResponse,
} from '@supaglue/schemas/v2/mgmt';
import { camelcaseKeys } from '@supaglue/utils/camelcase';
import { snakecaseKeys } from '@supaglue/utils/snakecase';
import type { Request, Response } from 'express';
import { Router } from 'express';
import connection from './connection/index';

const { customerService } = getDependencyContainer();

export default function init(app: Router): void {
  const customerRouter = Router();

  customerRouter.get(
    '/',
    async (
      req: Request<GetCustomersPathParams, GetCustomersResponse, GetCustomersRequest>,
      res: Response<GetCustomersResponse>
    ) => {
      const customers = await customerService.list(req.supaglueApplication.id);
      return res.status(200).send(customers.map(snakecaseKeys));
    }
  );

  customerRouter.put(
    '/',
    async (
      req: Request<UpsertCustomerPathParams, UpsertCustomerResponse, UpsertCustomerRequest>,
      res: Response<UpsertCustomerResponse>
    ) => {
      const customer = await customerService.upsert({
        applicationId: req.supaglueApplication.id,
        ...camelcaseKeys(req.body),
      });
      return res.status(201).send(snakecaseKeys(customer));
    }
  );

  customerRouter.get(
    '/:customer_id',
    async (
      req: Request<GetCustomerPathParams, GetCustomerResponse, GetCustomerRequest>,
      res: Response<GetCustomerResponse>
    ) => {
      const customer = await customerService.getByExternalId(req.supaglueApplication.id, req.params.customer_id);
      return res.status(200).send(snakecaseKeys(customer));
    }
  );

  customerRouter.delete(
    '/:customer_id',
    async (
      req: Request<DeleteCustomerPathParams, DeleteCustomerResponse, DeleteCustomerRequest>,
      res: Response<DeleteCustomerResponse>
    ) => {
      await customerService.delete(req.supaglueApplication.id, req.params.customer_id);
      return res.status(204).end();
    }
  );

  app.use('/customers', customerRouter);

  const perCustomerRouter = Router({ mergeParams: true });

  connection(perCustomerRouter);
  customerRouter.use('/:customer_id', perCustomerRouter);
}
